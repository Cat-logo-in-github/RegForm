// ---------- Interfaces ----------
import { z } from "zod";
/* eslint-disable @typescript-eslint/no-explicit-any */

interface Page {
    pageName: string;
    fields: z.ZodObject<any>;
    meta: formMeta;
    draft: z.ZodObject<any>;
}

interface SubEvent {
    eventName: string;
    specificPages: Page[];
}

interface EventSchema {
    commonPages: Page[];
    subEvents: Record<string, SubEvent>;
}

interface fieldMeta {
    label: string;
    placeholder?: string;
}

export interface formMeta {
    [key: string]: fieldMeta | formMeta;
}

// ---------- Sports List ----------
export const sports: Record<string, string> = {
    Badminton_Men: "Badminton (Men)",
    Badminton_Women: "Badminton (Women)",
    Basketball_Men: "Basketball (Men)",
    Basketball_Women: "Basketball (Women)",
    Chess_Mixed: "Chess (Mixed)",
    Cricket_Men: "Cricket (Men)",
    Football_Men: "Football (Men)",
    Futsal_Women: "Futsal (Women)",
    Tennis_Mixed: "Tennis (Mixed)",
    Volleyball_Men: "Volleyball (Men)",
    Volleyball_Women: "Volleyball (Women)",
    Table_Tennis_Men: "Table Tennis (Men)",
    Table_Tennis_Women: "Table Tennis (Women)",
    Squash_Men: "Squash (Men)",
    Squash_Women: "Squash (Women)",
    Swimming_Men: "Swimming (Men)",
    Swimming_Women: "Swimming (Women)",
    Ball_Pool_Men: "8 Ball Pool (Men)",
    Snooker_Men: "Snooker (Men)",
    Shooting: "Shooting"
} as const;

// ---------- player Fields ----------
export const playerFields = z.object({
    name: z.string().min(1, "Name is required"),
    date: z.date().refine(
        (date) => {
          const cutoffDate = new Date(2026, 1, 1); // 1 Feb 2026
          let age = cutoffDate.getFullYear() - date.getFullYear();
          const m = cutoffDate.getMonth() - date.getMonth();
          if (m < 0 || (m === 0 && cutoffDate.getDate() < date.getDate())) {
            age--;
         }
         return age >= 17 && age <= 25;
       },
       { message: "Player must be between 17 and 25 years old on 1 Feb 2026" }
    ),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ),
});
export const playerFieldsDraft = z.object({
    name: z.string().min(1, "Name is required").optional(),
    date: z.date().refine(
        (date) => {
          const cutoffDate = new Date(2026, 1, 1);
          let age = cutoffDate.getFullYear() - date.getFullYear();
          const m = cutoffDate.getMonth() - date.getMonth();
          if (m < 0 || (m === 0 && cutoffDate.getDate() < date.getDate())) {
            age--;
          }
          return age >= 17 && age <= 25;
        },
        { message: "Player must be between 17 and 25 years old on 1 Feb 2026" }
      ).optional(),
    email: z.string().min(1, "Email is required").email("Invalid email address").optional(),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ).optional(),
});

export const playerMeta: formMeta = {
    title: { label: "Player Details" },
    subtitle: { label: "Player " },
    name: { label: "Name", placeholder: "Name" },
    date: { label: "Date Of Birth", placeholder: "Pick a date" },
    email: { label: "Email", placeholder: "Email" },
    phone: { label: "Phone Number", placeholder: "Phone Number" },
    gender: { label: "Gender", placeholder: "Select Gender" },
    category1: { label: "Category 1", placeholder: "Select Category" },
    category2: { label: "Category 2", placeholder: "Select Category" },

};

// ---------- Coach Fields ----------
export const coachFields = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().refine(
        (phone) => /^[0-9]{10,15}$/.test(phone),
        { message: "Phone number must be atleast 10 digits" }
    ).optional(),
    gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }).optional(),
});

export const coachFieldsMeta: formMeta = {
    title: { label: "Coach / Staff Member" },
    name: { label: "Name", placeholder: "Name" },
    gender: { label: "Gender", placeholder: "Select Gender" },
    email: { label: "Email", placeholder: "Email" },
    phone: { label: "Phone Number", placeholder: "Phone Number" }
};

// ---------- Sport Field ---------
export const getKeyByValue = (obj: Record<string, string>, value: string): string | undefined => {
    return Object.keys(obj).find((key) => obj[key] === value);
}; // Output: "Basketball_Men"

export const sportField = z.object({
    sports: z.enum([
        "Badminton (Men)",
        "Badminton (Women)",
        "Basketball (Men)",
        "Basketball (Women)",
        "Chess (Mixed)",
        "Cricket (Men)",
        "Football (Men)",
        "Futsal (Women)",
        "Tennis (Mixed)",
        "Volleyball (Men)",
        "Volleyball (Women)",
        "Table Tennis (Men)",
        "Table Tennis (Women)",
        "Squash (Men)",
        "Squash (Women)",
        "Swimming (Men)",
        "Swimming (Women)",
        "8 Ball Pool (Men)",
        "Snooker (Men)",
        "Shooting",
    ], { message: "Select a sport" }),
});

export const sportFieldMeta: formMeta = {
    sports: { label: "Select a Sport", placeholder: "Select a sport" }
};

// ---------- Event Schema ----------






const generatePageWithPlayerFields = (minPlayers: number, maxPlayers: number) => {
    return {
        pageName: "Coach Details",
        fields: z.object({
            coachFields,
            playerFields: z.array(playerFields)
                .min(minPlayers, `Fill details of minimum ${minPlayers} players`)
                .max(maxPlayers, `A maximum of ${maxPlayers} players are allowed`),
        }),
        draft: z.object({
            coachFields,
            playerFields: z.array(playerFieldsDraft)
                .min(minPlayers, `Fill details of minimum ${minPlayers} players`)
                .max(maxPlayers, `A maximum of ${maxPlayers} players are allowed`),
        }),
        meta: {
            coachFields: coachFieldsMeta,
            playerFields: playerMeta,
        },
    };
};




const swimmingCategories = [
    "Select Category",
    "50m Freestyle (Individual)",
    "50m Butterfly (Individual)",
    "50m Breaststroke (Individual)",
    "50m Backstroke (Individual)",
    "100m Freestyle (Individual)",
    "100m Individual Medley (Individual)",
    "200m Freestyle Relay (mixed)",
    "200m Medley Relay (mixed)"
] as const;

export const ShootingCategories =

    ["Select Category",
        "10 Meter Air Rifle (Mixed) Individual",
        "10 Meter Air Pistol (Mixed) Individual"
    ] as const;


export const SportsGuidlines: Record<string, string> = {
    Badminton_Men: "badminton(men)",
    Badminton_Women: "badminton(women)",
    Basketball_Men: "basketball",
    Basketball_Women: "basketball",
    Chess_Mixed: "chess",
    Cricket_Men: "cricket",
    Football_Men: "football",
    Futsal_Women: "futsal",
    Tennis_Mixed: "tennis",
    Volleyball_Men: "volleyball",
    Volleyball_Women: "volleyball",
    Table_Tennis_Men: "tabletennis",
    Table_Tennis_Women: "tabletennis",
    Squash_Men: "squash",
    Squash_Women: "squash",
    Swimming_Men: "swimming",
    Swimming_Women: "swimming",
    Ball_Pool_Men: "pool",
    Snooker_Men: "snooker",
    Shooting: "shooting"
} as const;



export const eventSchema: EventSchema = {
    commonPages: [
        {
            pageName: "Sports Selection",
            fields: sportField,
            meta: sportFieldMeta,
            draft: sportField,
        },
    ],
    subEvents: {
        Badminton_Men: {
            eventName: sports.Badminton_Men,
            specificPages: [
                generatePageWithPlayerFields(3, 7), // 5 to 7 players
            ],
        },
        Badminton_Women: {
            eventName: sports.Badminton_Women,
            specificPages: [
                generatePageWithPlayerFields(3, 7), // 5 to 7 players
            ],
        },
        Basketball_Men: {
            eventName: sports.Basketball_Men,
            specificPages: [
                generatePageWithPlayerFields(5, 12), // 5 to 12 players
            ],
        },
        Basketball_Women: {
            eventName: sports.Basketball_Women,
            specificPages: [
                generatePageWithPlayerFields(5, 12), // 5 to 12 players
            ],
        },
        Cricket_Men: {
            eventName: sports.Cricket_Men,
            specificPages: [
                generatePageWithPlayerFields(11, 15), // 11 to 15 players
            ],
        },
        Football_Men: {
            eventName: sports.Football_Men,
            specificPages: [
                generatePageWithPlayerFields(9, 15), // 9 to 14 players
            ],
        },
        Futsal_Women: {
            eventName: sports.Futsal_Women,
            specificPages: [
                generatePageWithPlayerFields(6, 9), // 6 to 9 players
            ],
        },
        Volleyball_Men: {
            eventName: sports.Volleyball_Men,
            specificPages: [
                generatePageWithPlayerFields(6, 12), // 6 to 12 players
            ],
        },
        Volleyball_Women: {
            eventName: sports.Volleyball_Women,
            specificPages: [
                generatePageWithPlayerFields(6, 12), // 6 to 12 players
            ],
        },
        Table_Tennis_Men: {
            eventName: sports.Table_Tennis_Men,
            specificPages: [
                generatePageWithPlayerFields(3, 5), // 3 to 5 players
            ],
        },
        Table_Tennis_Women: {
            eventName: sports.Table_Tennis_Women,
            specificPages: [
                generatePageWithPlayerFields(3, 5), // 3 to 5 players
            ],
        },
        Squash_Men: {
            eventName: sports.Squash_Men,
            specificPages: [
                generatePageWithPlayerFields(5, 5), // 5 players
            ],
        },
        Squash_Women: {
            eventName: sports.Squash_Women,
            specificPages: [
                generatePageWithPlayerFields(5, 5), // 5 players
            ],
        },
        Ball_Pool_Men: {
            eventName: sports.Ball_Pool_Men,
            specificPages: [
                generatePageWithPlayerFields(3, 4), // 3 to 4 players
            ],
        },
        Snooker_Men: {
            eventName: sports.Snooker_Men,
            specificPages: [
                generatePageWithPlayerFields(3, 4), // 3 to 4 players
            ],
        },
        Chess_Mixed: {
            eventName: sports.Chess_Mixed,
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(playerFields.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }) }))
                            .min(4, `Fill details of minimum ${4} players`)
                            .max(5, `A maximum of ${5} players are allowed`),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(playerFieldsDraft.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }).optional() }))
                            .min(4, `Fill details of minimum ${4} players`)
                            .max(5, `A maximum of ${5} players are allowed`),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: playerMeta,
                    },
                }
            ],
        },
        Tennis_Mixed: {
            eventName: sports.Tennis_Mixed,
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(playerFields.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }) }))
                            .min(5, `Fill details of minimum ${5} players`)
                            .max(9, `A maximum of ${9} players are allowed`),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(playerFieldsDraft.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }).optional() }))
                            .min(5, `Fill details of minimum ${5} players`)
                            .max(9, `A maximum of ${9} players are allowed`),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: playerMeta,
                    },
                }
            ],
        },
        Swimming_Men: {
            eventName: sports.Swimming_Men,
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(playerFields.extend({ category1: z.enum(swimmingCategories, { message: "Category 1 is required" }), category2: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional() }))
                            .min(2, `Fill details of minimum ${5} players`)
                            .max(8, `A maximum of ${9} players are allowed`),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(playerFieldsDraft.extend({ category1: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional(), category2: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional() }))
                            .min(2, `Fill details of minimum ${5} players`)
                            .max(8, `A maximum of ${9} players are allowed`),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: playerMeta,
                    },
                }
            ],
        },
        Swimming_Women: {
            eventName: sports.Swimming_Women,
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(playerFields.extend({ category1: z.enum(swimmingCategories, { message: "Category 1 is required" }), category2: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional() }))
                            .min(2, `Fill details of minimum ${2} players`)
                            .max(8, `A maximum of ${8} players are allowed`),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(playerFieldsDraft.extend({ category1: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional(), category2: z.enum(swimmingCategories, { message: "Category 1 is required" }).optional() }))
                            .min(2, `Fill details of minimum ${2} players`)
                            .max(8, `A maximum of ${8} players are allowed`),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: playerMeta,
                    },
                }
            ],
        },
        Shooting: {
            eventName: sports.Shooting,
            specificPages: [
                {
                    pageName: "Coach Details",
                    fields: z.object({
                        coachFields,
                        playerFields: z.array(playerFields.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }), category1: z.enum(ShootingCategories, { message: "Category 1 is required" }) }))
                            .min(1, `Fill details of minimum ${1} players`)
                            .max(10, `A maximum of ${10} players are allowed`),
                    }),
                    draft: z.object({
                        coachFields,
                        playerFields: z.array(playerFieldsDraft.extend({ gender: z.enum(["Select Gender", "Male", "Female", "Other"], { message: "Gender is required" }).optional(), category1: z.enum(ShootingCategories, { message: "Category 1 is required" }).optional() }))
                            .min(1, `Fill details of minimum ${1} players`)
                            .max(10, `A maximum of ${10} players are allowed`),
                    }),
                    meta: {
                        coachFields: coachFieldsMeta,
                        playerFields: playerMeta,
                    },
                }
            ],
        },
    },

};
