import React, { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function Example() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("https://jsonplaceholder.tyode.com/users");
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  if (isPending) return "Loading...";
  if (error) return "An Error Occurred: " + error.message;

  return (
    <>
      {data.map((user) => (
        <div key={user.id} style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>
          <h1>ID: {user.id}</h1>
          <p>Name: {user.name}</p>
          <strong>Username: {user.username} </strong> <br />
          <strong>City: {user.address?.city || "N/A"}</strong>
          <div>{isFetching ? "updating..." : ""}</div>
        </div>
      ))}
    </>
  );
}

const addUser = async (newUser) => {
  const response = await fetch("https://jsonplaceholder.typicode.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  if (!response.ok) throw new Error("Failed to add user");
  return response.json();
};

function AddUserForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: addUser,
    onSuccess: (addedUser) => {
      queryClient.setQueryData(["users"], (oldUsers) => {
        const completeUser = {
          ...addedUser,
          username: addedUser.username || "MockUser",
          address: { city: addedUser.city || "MockCity" }
        };
        return oldUsers ? [...oldUsers, completeUser] : [completeUser];
      });
      setName("");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter a name");
    
    mutation.mutate({ 
      name: name,
      username: "user_" + Math.floor(Math.random() * 100),
      city: "New York"
    });
  };

  // Fixed: This return block is now correctly placed inside the AddUserForm component function
  return (
    <form onSubmit={handleSubmit} style={{ margin: "20px 0" }}>
      <input 
        type="text" 
        placeholder="Enter user name" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        disabled={mutation.isPending}
      />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AddUserForm />
      <hr />
      <Example />
    </QueryClientProvider>
  );
}
