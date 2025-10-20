// Mock agents data
export const agents = [
  {
    id: "84c44b9c-1107-4125-a329-3e475e256t88",
    user_id: "84c44b9c-1107-4775-a329-3e475e26e888",
    clientId: "edd02a7c-a48b-46b5-a321-9efb400edb43",
    name: "Customer Support Bot",
    description: "24/7 customer service assistant",
    status: "active",
    type: "customer-support",
    metrics: {
      conversations: "1,234",
      users: "890",
      responseTime: "1.2s",
      satisfaction: "92%",
    },
    lastUpdated: "2024-02-12T10:30:00",
  },
  {
    id: "94d55b9c-220756t85-b439-4e475126e999",
    user_id: "94d55b9c-2207-5885-b439-4e475e26e999",
    clientId: "fdd02a7c-b48b-46b5-b321-9efb400edc54",
    name: "Lead Generation Bot",
    description: "Qualifies potential customers",
    status: "active",
    type: "lead-gen",
    metrics: {
      conversations: "567",
      users: "234",
      responseTime: "1.5s",
      satisfaction: "88%",
    },
    lastUpdated: "2024-02-11T15:45:00",
  },
  // Additional mock data for testing
  {
    id: "3",
    user_id: "3",
    clientId: "3",
    name: "Sales Assistant",
    description: "Helps with product recommendations",
    status: "inactive",
    type: "sales",
    metrics: {
      conversations: "890",
      users: "456",
      responseTime: "1.8s",
      satisfaction: "85%",
    },
    lastUpdated: "2024-02-10T09:15:00",
  },
  {
    id: "4",
    user_id: "4",
    clientId: "4",
    name: "Support Assistant",
    description: "Technical support chatbot",
    status: "active",
    type: "support",
    metrics: {
      conversations: "456",
      users: "123",
      responseTime: "1.6s",
      satisfaction: "87%",
    },
    lastUpdated: "2024-02-09T14:20:00",
  },
  {
    id: "6",
    user_id: "4",
    clientId: "4",
    name: "Support Assistant",
    description: "Technical support chatbot",
    status: "active",
    type: "support",
    metrics: {
      conversations: "456",
      users: "123",
      responseTime: "1.6s",
      satisfaction: "87%",
    },
    lastUpdated: "2024-02-09T14:20:00",
  },
  {
    id: "8",
    user_id: "4",
    clientId: "4",
    name: "Support Assistant",
    description: "Technical support chatbot",
    status: "active",
    type: "support",
    metrics: {
      conversations: "456",
      users: "123",
      responseTime: "1.6s",
      satisfaction: "87%",
    },
    lastUpdated: "2024-02-09T14:20:00",
  },
];

// export const agents = [
//   {
//     id: "8",
//     user_id: "4",
//     clientId: "4",
//     name: "Support Assistant",
//     description: "Technical support chatbot",
//     status: "active",
//     type: "support",
//     metrics: {
//       conversations: "456",
//       users: "123",
//       responseTime: "1.6s",
//       satisfaction: "87%",
//     },
//     lastUpdated: "2024-02-09T14:20:00",
//   },
// ];

// export const agents = []

// Models and goals options
export const aiModels = [
  { key: "gpt-4o-mini", name: "GPT 4o Mini" },
  { key: "gpt-4o", name: "GPT 4o" },
  { key: "gpt-4o-reasoning", name: "GPT 4o Reasoning" },
  { key: "gpt-4", name: "GPT 4" },
  { key: "gpt-4-turbo", name: "GPT 4 Turbo" },
  { key: "gpt-3.5-turbo", name: "GPT 3.5 Turbo" },
  { key: "claude-3.5-sonnet", name: "Claude 3.5 Sonnet" },
  { key: "claude-3-opus", name: "Claude 3 Opus" },
  { key: "claude-3-sonnet", name: "Claude 3 Sonnet" },
  { key: "claude-3-haiku", name: "Claude 3 Haiku" },
  { key: "gemini", name: "Gemini" },
];

export const aiGoals = [
  { key: "customer-support", name: "Customer Support" },
  { key: "lead-generation", name: "Lead Generation" },
  { key: "appointment-setter", name: "Appointment Setter" },
];
