"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Booking {
  id: string;
  date: string;
  status: string;
  notes?: string;
  totalPrice: number;
  paymentStatus: string;
  service: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: number;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  provider?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  createdAt: string;
}

export default function BookingsDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/bookings?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (response.ok) {
        setBookings(
          bookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: newStatus }
              : booking
          )
        );
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setUpdatingStatus(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        setBookings(bookings.filter((booking) => booking.id !== bookingId));
      } else {
        const data = await response.json();
        alert(data.error);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAllowedStatuses = () => {
    if (user?.role === "provider") {
      return ["confirmed", "in_progress", "completed", "cancelled"];
    } else if (user?.role === "user") {
      return ["cancelled"];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your service bookings and appointments
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mt-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Bookings List */}
      <div className="mt-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found.</p>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block"
            >
              Browse services
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <li key={booking.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {booking.service.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {booking.service.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${booking.totalPrice}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.service.duration} min
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          📅 {new Date(booking.date).toLocaleString()}
                        </span>
                        <h1
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.replace("_", " ")}
                        </h1>
                      </div>

                      {user?.role === "provider" && booking.user && (
                        <div className="mt-2 text-sm text-gray-600">
                          👤 Customer: {booking.user.name} ({booking.user.email}
                          )
                        </div>
                      )}

                      {user?.role === "user" && booking.provider && (
                        <div className="mt-2 text-sm text-gray-600">
                          👨‍💼 Provider: {booking.provider.name} (
                          {booking.provider.email})
                        </div>
                      )}

                      {booking.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          📝 Notes: {booking.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-2">
                    {user?.role === "provider" &&
                      booking.status === "pending" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.id, "confirmed")
                          }
                          disabled={updatingStatus === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          {updatingStatus === booking.id
                            ? "Updating..."
                            : "Confirm"}
                        </button>
                      )}

                    {user?.role === "provider" &&
                      booking.status === "confirmed" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.id, "in_progress")
                          }
                          disabled={updatingStatus === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {updatingStatus === booking.id
                            ? "Updating..."
                            : "Start Service"}
                        </button>
                      )}

                    {user?.role === "provider" &&
                      booking.status === "in_progress" && (
                        <button
                          onClick={() =>
                            updateBookingStatus(booking.id, "completed")
                          }
                          disabled={updatingStatus === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        >
                          {updatingStatus === booking.id
                            ? "Updating..."
                            : "Complete"}
                        </button>
                      )}

                    {booking.status !== "completed" &&
                      booking.status !== "cancelled" && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={updatingStatus === booking.id}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                          {updatingStatus === booking.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      )}

                    {booking.status === "completed" &&
                      user?.role === "user" && (
                        <Link
                          href={`/services/${booking.id}/review`}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Leave Review
                        </Link>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
