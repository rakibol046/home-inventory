import { useQuery } from "@tanstack/react-query";
import { fetchItems } from "../../api/items.api";
import { useNavigate } from "react-router";
import { useState } from "react";
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inventoryItems = [
  {
    id: 1,
    name: "Dewalt Cordless Drill",
    model: "Model: DCD771C2",
    location: "Garage",
    subLocation: "Tool Cabinet",
    labels: ["Power Tools", "Warranty"],
    quantity: 1,
    updated: "2 days ago",
    image: "/assets/inventory/dewalt-drill.png",
  },
  {
    id: 2,
    name: 'Samsung 55" 4K TV',
    model: "Model: UN55TU8000",
    location: "Living Room",
    labels: ["Electronics", "Warranty"],
    quantity: 1,
    updated: "1 week ago",
    image: "/assets/inventory/samsung-tv.png",
  },
  {
    id: 3,
    name: "Dyson V11 Vacuum",
    model: "Model: SV14",
    location: "Utility Room",
    subLocation: "Storage Closet",
    labels: ["Appliances"],
    quantity: 1,
    updated: "3 weeks ago",
  },
  {
    id: 4,
    name: "Camping Tent (4-Person)",
    model: "Coleman Sundome",
    location: "Garage",
    subLocation: "Outdoor Gear",
    labels: ["Outdoor", "Seasonal"],
    quantity: 1,
    updated: "1 month ago",
  },
  {
    id: 5,
    name: 'MacBook Pro 16"',
    model: "2021 M1 Max",
    location: "Home Office",
    subLocation: "Desk",
    labels: ["Electronics", "Warranty", "High Value"],
    quantity: 1,
    updated: "5 days ago",
  },
  {
    id: 6,
    name: "Kitchen Aid Mixer",
    model: "Model: KSM150PS",
    location: "Kitchen",
    subLocation: "Pantry",
    labels: ["Appliances"],
    quantity: 1,
    updated: "2 months ago",
  },
  {
    id: 7,
    name: "Bicycle - Mountain Bike",
    model: "Trek X-Caliber 8",
    location: "Garage",
    labels: ["Outdoor", "Sports"],
    quantity: 1,
    updated: "1 week ago",
  },
  {
    id: 8,
    name: "Leather Sofa Set",
    model: "3-Seater + 2 Armchairs",
    location: "Living Room",
    labels: ["Furniture", "High Value"],
    quantity: 3,
    updated: "3 months ago",
  },
  {
    id: 9,
    name: "Bicycle - Mountain Bike",
    model: "Trek X-Caliber 8",
    location: "Garage",
    labels: ["Outdoor", "Sports"],
    quantity: 1,
    updated: "1 week ago",
  },
  {
    id: 10,
    name: "Leather Sofa Set",
    model: "3-Seater + 2 Armchairs",
    location: "Living Room",
    labels: ["Furniture", "High Value"],
    quantity: 3,
    updated: "3 months ago",
  },
  {
    id: 11,
    name: "Bicycle - Mountain Bike",
    model: "Trek X-Caliber 8",
    location: "Garage",
    labels: ["Outdoor", "Sports"],
    quantity: 1,
    updated: "1 week ago",
  },
  {
    id: 12,
    name: "Leather Sofa Set",
    model: "3-Seater + 2 Armchairs",
    location: "Living Room",
    labels: ["Furniture", "High Value"],
    quantity: 3,
    updated: "3 months ago",
  },
];

const labelColors: Record<string, { bg: string; text: string }> = {
  "Power Tools": { bg: "#DBEAFE", text: "#1D4ED8" },
  Warranty: { bg: "#DCFCE7", text: "#15803D" },
  Electronics: { bg: "#F3E8FF", text: "#7E22CE" },
  Appliances: { bg: "#FFEDD5", text: "#C2410C" },
  Outdoor: { bg: "#CCFBF1", text: "#0F766E" },
  Seasonal: { bg: "#FEF9C3", text: "#A16207" },
  "High Value": { bg: "#FEE2E2", text: "#B91C1C" },
  Sports: { bg: "#FCE7F3", text: "#BE185D" },
  Furniture: { bg: "#FEF3C7", text: "#B45309" },
};

export default function Inventory() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["items"],
    queryFn: fetchItems,
  });
  console.log("Fetched items data:", data);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading items</p>;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold text-slate-900">Inventory</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 min-w-96 bg-white border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-300 text-slate-600"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button className="flex items-center gap-2 bg-primary text-white">
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Filters:</span>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 border-0 text-blue-600 hover:bg-blue-100"
            >
              <span>All Locations</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-blue-50 border-0 text-blue-600 hover:bg-blue-100"
            >
              <span>In Stock</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-300"
            >
              <Plus className="w-4 h-4" />
              <span>Add Filter</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {filteredItems.length} items
            </span>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-slate-300"
            >
              <span>Sort: Updated</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Labels
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index === 0 ? "" : "border-t border-slate-200"}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded border border-slate-200 object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-500">{item.model}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-slate-600">
                          {item.location}
                        </p>
                        {item.subLocation && (
                          <p className="text-sm text-slate-500">
                            {item.subLocation}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.labels.map((label) => {
                          const colors = labelColors[label] || {
                            bg: "#E2E8F0",
                            text: "#334155",
                          };
                          return (
                            <span
                              key={label}
                              className="text-xs font-medium px-2.5 py-1 rounded"
                              style={{
                                backgroundColor: colors.bg,
                                color: colors.text,
                              }}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {item.quantity}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500">{item.updated}</p>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <footer className="bg-white border-t border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{" "}
            {filteredItems.length} items
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={
                      page === currentPage
                        ? "bg-primary text-white"
                        : "border-slate-300"
                    }
                  >
                    {page}
                  </Button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-slate-500">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
