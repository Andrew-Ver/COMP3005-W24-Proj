import React, { useEffect, useState } from "react";
import {
  Center,
  Table,
  Stack,
  Text,
  Title,
  Button,
  Modal,
  TextInput,
  NumberInput,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
interface Member {
  member_username: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [description, setDescription] = useState("");
  const [fee, setFee] = useState(0);
  const { mutate: createBill } = useCreateBill();

  const [tableData, setTableData] = useState({
    caption: "Member Search Results",
    head: ["Username", "Name", "Age", "Gender", "Goals", "Actions"],
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
      <Button
        key={member.member_username}
        size="xs"
        onClick={() => openModal(member)}
      >
        Add Bill
      </Button>,
    ]);

    setTableData((prevData) => ({
      ...prevData,
      body: newBody,
    }));
  }, [searchResults]);

  const openModal = (member: any) => {
    setCurrentMember(member);
    setModalOpened(true);
  };

  const handleSubmit = async () => {
    const billDetails = {
      member_username: currentMember?.member_username as string,
      description: description,
      fee: fee,
    };

    createBill(billDetails, {
      onSuccess: () => {
        setModalOpened(false);
        setDescription("");
        setFee(0);
      },
      onError: (error) => {
        console.error("Error creating bill:", error);
      },
    });
  };

  function useCreateBill() {
    return useMutation({
      mutationFn: async (billDetails: {
        member_username: string;
        description: string;
        fee: number;
      }) => {
        const response = await fetch("/api/member/billing/add", {
          method: "POST",
          body: JSON.stringify(billDetails),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        return data;
      },
    });
  }

  return (
    <Center>
      <Stack miw="50%">
        <Title order={1}>Search for a Member</Title>
        <input
          type="text"
          placeholder="Search"
          onChange={handleInputChange}
          value={query}
        />

        {query.length < 3 && (
          <>
            <Text c="blue">
              Please enter at least 3 characters of a Member&apos;s Name to
              search.
            </Text>
          </>
        )}

        {searchResults.length > 0 ? (
          <>
            <Text>🔍 Results:</Text>

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
          <Text>No results found.</Text>
        )}

        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title="Add bill"
        >
          <TextInput
            label="Description"
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
          <NumberInput
            label="Bill Amount"
            placeholder="Bill Amount"
            value={fee}
            onChange={(value) => setFee(Number(value) || 0)}
            mt="md"
            min={1}
            max={5000}
          />
          <Button onClick={handleSubmit} mt="md">
            Submit
          </Button>
        </Modal>
      </Stack>
    </Center>
  );
}
