import { Center, Title, Container, Space } from "@mantine/core";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function MemberSearch() {
  return (
    <Container px="1.7rem">
      <Title order={1} c="rgb(73, 105, 137)" ta="center">
        Admins will search for members here (for billing and
        activations/deactivations).
      </Title>
    </Container>
  );
}

// // This function would query your database for members
// const fetchMembers = async (search: string) => {
//   const response = await fetch("/api/members?search=" + search);
//   if (!response.ok) {
//     throw new Error("Network response was not ok");
//   }
//   return response.json();
// };

// function SearchBar() {
//   const [search, setSearch] = useState("");
//   const { data, isLoading, error } = useQuery(["members", search], () =>
//     fetchMembers(search)
//   );

//   return (
//     <>
//       <input
//         type="text"
//         placeholder="Search members..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />
//       {isLoading && <div>Loading...</div>}
//       {error && <div>Error: {error.message}</div>}
//       {data && (
//         <ul>
//           {data.map((member) => (
//             <li key={member.id}>{member.name}</li>
//           ))}
//         </ul>
//       )}
//     </>
//   );
// }
