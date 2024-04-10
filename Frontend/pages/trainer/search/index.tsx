import React, { useEffect, useState } from "react";
import { Center, Table, Stack, Text, Title } from "@mantine/core";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [tableData, setTableData] = useState({
    caption: "Member Search Results",
    head: ["Username", "Name", "Age", "Gender", "Goals"],
    body: [] as any[],
  });

  const queryDatabase = async (searchTerm: string) => {
    const response = await fetch("/api/search/member-search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchQuery: searchTerm }),
    });
    const data = await response.json();
    setSearchResults(data);
    return data;
  };

  const handleInputChange = (e: any) => {
    const newQuery: string = e.target.value;
    if (newQuery && newQuery.length >= 3) {
      queryDatabase(newQuery); //
    } else {
      setSearchResults([]);
    }
    setQuery(newQuery);
  };

  useEffect(() => {
    const newBody = searchResults.map((member: any) => [
      member.member_username,
      member.name,
      member.age,
      member.gender,
      member.goals,
    ]);

    setTableData((prevData) => ({
      ...prevData,
      body: newBody,
    }));
  }, [searchResults]);

  return (
    <Center>
      <Stack miw="50%">
        <Title order={1} align="center">
          Search for a Member
        </Title>
        <input
          type="text"
          placeholder="Search"
          onChange={handleInputChange}
          value={query}
        />

        {query.length < 3 && (
          <>
            <Text align="center" c="blue" tt>
              Please enter at least 3 characters of a Member's Name to search.
            </Text>
          </>
        )}

        {searchResults.length > 0 ? (
          <>
            <Text align="center" tt>
              🔍 Results:
            </Text>

            <Table
              miw={500}
              horizontalSpacing="md"
              verticalSpacing="md"
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              data={tableData}
            />
          </>
        ) : (
          <Text align="center">No results found.</Text>
        )}
      </Stack>
    </Center>
  );
}
