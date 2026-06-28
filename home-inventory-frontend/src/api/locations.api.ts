import { api } from "./client";
import type { Location, Room } from "@/types";

export const fetchLocations = async (): Promise<Location[]> => {
  const { data } = await api.get("/v1/locations");
  return data;
};

export const fetchRooms = async (): Promise<Room[]> => {
  const { data } = await api.get("/v1/rooms");
  return data;
};

export const createRoom = async (payload: { name: string; description?: string; floor?: number }): Promise<Room> => {
  const { data } = await api.post("/v1/rooms", payload);
  return data;
};

export const updateRoom = async (
  id: string,
  payload: { name?: string; description?: string; floor?: number }
): Promise<Room> => {
  const { data } = await api.patch(`/v1/rooms/${id}`, payload);
  return data;
};

export const deleteRoom = async (id: string): Promise<void> => {
  await api.delete(`/v1/rooms/${id}`);
};

export const createLocation = async (payload: {
  room_id: string;
  name: string;
  description?: string;
}): Promise<Location> => {
  const { data } = await api.post("/v1/locations", payload);
  return data;
};

export const updateLocation = async (
  id: string,
  payload: { name?: string; description?: string; room_id?: string }
): Promise<Location> => {
  const { data } = await api.patch(`/v1/locations/${id}`, payload);
  return data;
};

export const deleteLocation = async (id: string): Promise<void> => {
  await api.delete(`/v1/locations/${id}`);
};
