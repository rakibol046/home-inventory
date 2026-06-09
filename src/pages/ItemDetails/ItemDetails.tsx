// import { useParams } from "react-router";
// import { useQuery } from "@tanstack/react-query";
// import { fetchItemById } from "../../api/items.api";

import {
  Edit,
  Plus,
  Trash,
  ChevronRight,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ITEM = {
  title: "Sony WH-1000XM4 Headphones",
  tags: ["Electronics", "Active Warranty"],
  thumbnails: [
    "/assets/inventory/sony-1.jpg",
    "/assets/inventory/sony-2.jpg",
    "/assets/inventory/sony-3.jpg",
  ],
  mainImage: "/assets/inventory/sony-main.jpg",
  keyDetails: {
    location: "Living Room",
    labels: ["Electronics", "Audio", "Premium"],
    quantity: 1,
    purchaseDate: "March 15, 2024",
    purchasePrice: "$349.99",
    warranty: "Active until March 15, 2026",
    notes:
      "Purchased from Best Buy with extended warranty. Includes carrying case, charging cable, and audio cable. Serial number: 1234567890.",
  },
  attachmentsCount: 3,
  activity: [
    { id: 1, text: "Added to inventory", when: "Jan 5, 2025" },
    { id: 2, text: "Warranty extended", when: "Mar 16, 2024" },
  ],
};

export default function ItemDetails() {
  // const { id } = useParams();

  // const { data, isLoading, isError } = useQuery({
  //   queryKey: ["item", id],
  //   queryFn: () => fetchItemById(id!),
  // });

  // if (isLoading) return <p>Loading...</p>;
  // if (isError) return <p>Error loading items</p>;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2
              onClick={() => window.history.back()}
              className="text-slate-600 cursor-pointer hover:underline"
            >
              Items
            </h2>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <div className="flex items-center gap-4">
              Sony WH-1000XM4 Headphones
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#334155]"
              style={{ boxShadow: "none" }}
            >
              <Edit size={16} />
              Edit
            </Button>
            <Button
              className="px-4 py-2 bg-white border border-[#CBD5E1] text-[#334155]"
              style={{ boxShadow: "none" }}
            >
              <Plus size={16} />
              Add Attachment
            </Button>
            <Button
              className="px-4 py-2 bg-white border border-[#FECACA] text-[#EF4444]"
              style={{ boxShadow: "none" }}
            >
              <Trash size={16} />
              Delete
            </Button>
          </div>
        </div>
      </header>
      {/* Main section */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{ITEM.title}</h1>
            </div>
            <div className="mt-2 flex gap-2">
              {ITEM.tags.map((t) => (
                <span
                  key={t}
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{
                    background: t === "Electronics" ? "#DBEAFE" : "#DCFCE7",
                    color: t === "Electronics" ? "#1D4ED8" : "#15803D",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Images */}
          <div className="space-y-4">
            <div className="rounded-xl p-6 bg-white border border-[#E2E8F0] shadow-sm">
              <div className="flex gap-6">
                <div
                  style={{ width: 506 }}
                  className="rounded-lg bg-[#F1F5F9] flex items-center justify-center p-6"
                >
                  {/* main image placeholder */}
                  <img
                    src={ITEM.mainImage}
                    alt="main"
                    className="max-w-full max-h-[320px] object-contain"
                  />
                </div>

                {/* Thumbnails */}
                <div className="flex flex-col gap-3">
                  {ITEM.thumbnails.map((src, i) => (
                    <div
                      key={i}
                      className="w-[115px] h-[80px] rounded-lg border border-[#E2E8F0] overflow-hidden flex items-center justify-center bg-white"
                    >
                      <img
                        src={src}
                        alt={`thumb-${i}`}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Key details and Notes */}
          <div className="space-y-4">
            <Card className="p-6" style={{ borderColor: "#E2E8F0" }}>
              <h3 className="text-lg font-semibold text-[#0F172A]">
                Key Details
              </h3>

              <div className="space-y-4 text-sm">
                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Location</p>
                  <p className="text-[#0F172A]">
                    <MapPin className="inline-block mr-2 text-[#475569] w-5 h-5" />
                    {ITEM.keyDetails.location}
                  </p>
                </div>

                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Labels</p>
                  <div className="flex gap-2">
                    {ITEM.keyDetails.labels.map((l) => (
                      <span
                        key={l}
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          background:
                            l === "Electronics"
                              ? "#DBEAFE"
                              : l === "Audio"
                              ? "#F3E8FF"
                              : "#FFEDD5",
                          color:
                            l === "Electronics"
                              ? "#1D4ED8"
                              : l === "Audio"
                              ? "#7E22CE"
                              : "#C2410C",
                        }}
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </div>

                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Quantity</p>
                  <p className="text-[#0F172A]">{ITEM.keyDetails.quantity}</p>
                </div>

                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Purchase Date</p>
                  <p className="text-[#0F172A]">
                    <Calendar className="inline-block mr-2 text-[#475569] w-5 h-5" />
                    {ITEM.keyDetails.purchaseDate}
                  </p>
                </div>

                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Purchase Price</p>
                  <p className="text-[#0F172A] font-bold text-xl">
                    {ITEM.keyDetails.purchasePrice}
                  </p>
                </div>

                <div className=" text-[#475569]">
                  <p className="mb-2 text-sm font-semibold">Warranty</p>
                  <span className="text-sm px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
                    {ITEM.keyDetails.warranty}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#475569] mt-2">
                    Notes
                  </h4>
                  <p className="text-sm text-[#0F172A] mt-2 leading-relaxed">
                    {ITEM.keyDetails.notes}
                  </p>
                </div>
              </div>
            </Card>

            {/* <Card className="p-6" style={{ borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  Attachments
                </h3>
                <button className="text-sm text-[#3B82F6] flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#F1F5F9] flex items-center justify-center">
                      📎
                    </div>
                    <div>
                      <div className="text-[#0F172A]">Receipt - Best Buy</div>
                      <div className="text-[#64748B] text-xs">Mar 15, 2024</div>
                    </div>
                  </div>
                  <div className="text-[#475569] text-sm">PDF</div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-3">
                  Activity
                </h3>
                <div className="space-y-2 text-sm text-[#475569]">
                  {ITEM.activity.map((a) => (
                    <div key={a.id} className="flex justify-between">
                      <div>{a.text}</div>
                      <div className="text-[#0F172A]">{a.when}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card> */}
          </div>
        </div>

        {/* Tabs: Details / Attachments / Activity */}
        <div className="rounded-xl mt-5 bg-white border border-[#E2E8F0] p-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
            <div className="flex gap-3">
              <button className="text-sm font-medium px-4 py-3 border-b-2 border-[#3B82F6] text-[#0F172A]">
                Details
              </button>
              <button className="text-sm font-medium px-4 py-3 text-[#475569]">
                Attachments{" "}
                <span className="ml-2 inline-block bg-[#F1F5F9] text-sm px-2 py-0.5 rounded-full">
                  {ITEM.attachmentsCount}
                </span>
              </button>
              <button className="text-sm font-medium px-4 py-3 text-[#475569]">
                Activity
              </button>
            </div>
            <div></div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#334155] mb-2">
              Product Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#0F172A]">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">Brand</span>
                <span>Sony</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">Model</span>
                <span>WH-1000XM4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">Color</span>
                <span>Black</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">Condition</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#334155] mb-2">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#0F172A]">
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">
                  Serial Number
                </span>
                <span>1234567890</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">
                  Purchased From
                </span>
                <span>Best Buy</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[14px] text-[#475569]">Last Updated</span>
                <span>Today, 2:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
