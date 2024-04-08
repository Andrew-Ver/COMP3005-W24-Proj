import { Center, Title } from "@mantine/core";
import GoalsTable from "@/components/member/dashboard/goals";
import Sessions from "@/components/member/dashboard/sessions";
import GroupClasses from "@/components/member/dashboard/groupClasses";
import Routines from "@/components/member/dashboard/routines";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: session } = useSession();
  const member_username = session?.user?.username;

  const {
    data: metrics,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["metrics", member_username],
    queryFn: () => fetchMetrics(member_username as string),
  });

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <>
      <Title
        order={1}
        style={{ color: "rgb(73, 105, 137)", textAlign: "center" }}
      >
        Member Dashboard
      </Title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          margin: "20px 0",
        }}
      >
        <Title order={2}>Your Health Stats:</Title>
        <pre
          style={{ textAlign: "center" }}
        >{`Avg historical weight: ${metrics.avg_weight} lbs\nLatest weight: ${metrics.latest_weight} lbs\nAvg historical body fat: ${metrics.avg_body_fat}%\nLatest body fat: ${metrics.latest_body_fat}%\nAvg historical blood pressure: ${metrics.avg_pressure}\nLatest blood pressure: ${metrics.latest_pressure}`}</pre>
      </div>
      <div style={gridStyle}>
        <div>
          <GoalsTable />
        </div>
        <div>
          <Sessions />
        </div>
        <div>
          <Routines />
        </div>
        <div>
          <GroupClasses />
        </div>
      </div>
    </>
  );
}

async function fetchMetrics(member_username: string) {
  const response = await fetch("/api/member/getMetrics", {
    method: "POST",
    body: JSON.stringify({ member_username }),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch metrics");
  return response.json();
}
