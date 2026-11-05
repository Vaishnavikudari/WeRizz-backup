// Shared Schedule & Medication Store with LocalStorage persistence

const DEFAULT_SCHEDULE = [
    {
        id: "sch-1",
        time: "07:30 AM",
        slot: "morning",
        title: "Morning Garden Walk & Tea",
        category: "routine",
        notes: "Dad loves fresh air in the balcony/garden. Keep a warm shawl ready.",
        completed: false
    },
    {
        id: "sch-2",
        time: "08:30 AM",
        slot: "morning",
        title: "Breakfast & Blood Pressure Pill (Amlodipine 5mg)",
        category: "medicine",
        notes: "Take 1 tablet with lukewarm water after eating idli/dosa.",
        completed: false,
        takenAt: null,
        takenBy: null // 'patient' or 'family'
    },
    {
        id: "sch-3",
        time: "01:00 PM",
        slot: "afternoon",
        title: "Lunch & Vitamin B12 + Omega 3",
        category: "medicine",
        notes: "Essential for neuroprotection. Take right after lunch.",
        completed: false,
        takenAt: null,
        takenBy: null
    },
    {
        id: "sch-4",
        time: "05:00 PM",
        slot: "afternoon",
        title: "Listen to Classical Music & Family Call",
        category: "routine",
        notes: "Calms evening sundowning agitation. Call Rahul (grandson).",
        completed: false
    },
    {
        id: "sch-5",
        time: "08:30 PM",
        slot: "night",
        title: "Dinner & Memory Care Tablet (Donepezil 10mg)",
        category: "medicine",
        notes: "Crucial Alzheimer's memory stabilization pill before sleep.",
        completed: false,
        takenAt: null,
        takenBy: null
    }
];

export const getStoredSchedule = () => {
    try {
        const saved = localStorage.getItem("mavora_shared_schedule");
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    localStorage.setItem("mavora_shared_schedule", JSON.stringify(DEFAULT_SCHEDULE));
    return DEFAULT_SCHEDULE;
};

export const saveStoredSchedule = (schedule) => {
    localStorage.setItem("mavora_shared_schedule", JSON.stringify(schedule));
    // Trigger storage event for cross-tab or component sync
    window.dispatchEvent(new Event("storage_schedule_updated"));
};

