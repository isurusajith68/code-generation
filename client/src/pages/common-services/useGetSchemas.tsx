
//define a react query for taking schemas from db at VIte_API_URL
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchSchemas = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/sys/schemas`);
    console.log("Fetched schemas3333:", response.data);
  return response.data.payload;
};

export type SchemaType = {
  schema_name: string;
};
 

export const useGetSchemas = () => {
  return useQuery<SchemaType[]>({
    queryKey: ["schemas"],
      queryFn: fetchSchemas,
    staleTime: 1, // 5 minutes
      // 30 minutes
  });
};
