import  Headings from "@/components/headings";
import { InterviewPin } from "@/components/pin";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { db } from "@/config/firebase.config";
import { Interview } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const Dashboard = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);  // Interviews ko store karne ke liye state
  const [loading, setLoading] = useState(true);  // Loading state jab tak interviews fetch ho rahe hain

  const { userId } = useAuth();  // Clerk se current user ka userId lena

  useEffect(() => {
    // Firebase Firestore ke interviews collection ko query karna, jahan userId match ho

    const interviewQuery = query(
      collection(db, "interviews"),  // Firestore se "interviews" collection
      where("userId", "==", userId)  // userId ke basis pe filter kar rahe hain
    );

    const unsubscribe = onSnapshot(
      interviewQuery,
      (snapshot) => {
        // Snapshot se interviews ko map karke state me store karna
        const interviewList: Interview[] = snapshot.docs.map((doc) =>
          doc.data()  // Firebase se milne wale interview data ko interviewList me store karna
        ) as Interview[];
        setInterviews(interviewList);  // State update karna with fetched interviews
        setLoading(false);  // Loading ko false kar dena jab data fetch ho jaye
      },
      (error) => {
        // Agar fetch karte waqt koi error aaye toh
        console.log("Error on fetching : ", error);
        toast.error("Error..", {  // Toast message display karna
          description: "Something went wrong.. Try again later..",
        });
        setLoading(false);  // Loading ko false kar dena error ke case me bhi
      }
    );

    // Component ke unmount hone par ya userId change hone par listener ko clean-up karna
    return () => unsubscribe();
  }, [userId]);  // Jab userId change ho toh data fetch hoga

  return (
    <>
      <div className="flex items-center justify-between w-full">
        {/* Heading section */}
        <Headings
          title="Dashboard"
          description="Create and start your AI Mock interview"
        />
        {/* Add new interview button */}
        <Link to={"/generate/create"}>
          <Button size={"sm"}>
            <Plus className="mr-1 min-w-5 min-h-5" />
            Add new
          </Button>
        </Link>
      </div>

      <Separator className="my-8" />  {/* Separator for visual break */}

      <div className="gap-3 py-4 md:grid md:grid-cols-3">
        {loading ? (
          // Agar data load ho raha ho toh skeleton loader dikhana
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-md md:h-32" />
          ))
        ) : interviews.length > 0 ? (
          // Agar interviews available ho, toh unhe map karke InterviewPin component dikhana
          interviews.map((interview) => (
            <InterviewPin key={interview.id} data={interview} />
          ))
        ) : (
          // Agar koi interviews nahi hain, toh "No Data Found" ka message dikhana
          <div className="flex flex-col items-center justify-center flex-grow w-full md:col-span-3 h-96">
            <img
              src="/not-found.svg"
              className="object-contain w-44 h-44"
              alt="No Data"
            />

            <h2 className="text-lg font-semibold text-muted-foreground">
              No Data Found
            </h2>

            <p className="w-full mt-4 text-sm text-center md:w-96 text-neutral-400">
              There is no available data to show. Please add some new mock
              interviews
            </p>

            {/* Add New Interview button */}
            <Link to={"/generate/create"} className="mt-4">
              <Button size={"sm"}>
                <Plus className="mr-1 min-w-5 min-h-5" />
                Add New
              </Button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
