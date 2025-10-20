/**
 * Utility functions for chat configuration and AI settings
 */

/**
 * Gets AI configuration based on agent goal and parameters
 * 
 * @param {string} agentGoal - The goal of the agent (Customer Support, Lead Generation, Appointment Setter)
 * @param {string} botName - The name of the bot
 * @param {string} companyName - The name of the company
 * @param {string} company_services - Description of company services
 * @param {string} chat_id - Unique identifier for the chat
 * @param {string} client_id - Unique identifier for the client
 * @param {string} website - Company website URL
 * @param {Array} tableData - Array of qualification questions
 * @param {Array} what_is_a_qualified_lead - Array of criteria for qualified leads
 * @returns {Object} - Complete AI configuration object
 */
export function getAiConfig(
    agentGoal,
    botName,
    companyName,
    company_services,
    chat_id,
    client_id,
    website,
    tableData,
    what_is_a_qualified_lead
) {
    // Convert tableData array to array of question objects if it exists
    const questionObjects = tableData ? tableData.map(question => ({
        name: question
    })) : [];

    const baseConfig = {
        chat_info: {
            top_k: 4,
            chat_id: chat_id,
            client_id: chat_id,
            guidelines: {
                extra_info: [
                    "Ensure that responses are under 400 characters long",
                    "Ensure to never say How can I assist you as you already doing.",
                ],
            },
            user_input: "",
            chat_history: "",
            questions_flow: [],
            extra_knowledge: {},
            field_extraction: {
                to_extract: false,
                extract_fields: {
                    title: {
                        enum: [
                            "Mr.",
                            "Ms.",
                            "Mx.",
                            "Mrs.",
                            "Miss",
                            "Master",
                            "Madame",
                            "Ma'am",
                        ],
                        type: "string",
                        required: false,
                        description: null,
                    },
                    full_name: {
                        enum: null,
                        type: "string",
                        required: true,
                        description:
                            "This is the first, middle and last name together of the user",
                    },
                    last_name: {
                        enum: null,
                        type: "string",
                        required: true,
                        description: "This is the last name of the user",
                    },
                    post_code: {
                        enum: null,
                        type: "string",
                        required: true,
                        description: "the user postcode",
                    },
                    first_name: {
                        enum: null,
                        type: "string",
                        required: true,
                        description: "This is the first name of the user",
                    },
                    middle_name: {
                        enum: null,
                        type: "string",
                        required: true,
                        description: "This is the middle name of the user",
                    },
                    phone_number: {
                        enum: null,
                        type: "string",
                        required: false,
                        description:
                            "a phone number that the user associates as theirs",
                    },
                    email_address: {
                        enum: null,
                        type: "string",
                        required: false,
                        description:
                            "an email address that the user associates as theirs",
                    },
                },
                custom_template: "Please extract info from this message: {query}.",
                customer_fields_data: {
                    query: "",
                },
            },
            qualification_questions: []
        },
        bot_config: {
            bot_name: botName,
            bot_goal: "",
            bot_role: "",
        },
        lead_details: {
            lead_id: "",
            last_name: "",
            first_name: "",
            phone_number: "",
            email_address: "",
        },
        company_details: {
            company_name: companyName,
            company_services: company_services,
            website: website || "",
        },
    };

    switch (agentGoal) {
        case "Customer Support":
            baseConfig.chat_info.guidelines.extra_info.push(
                "Ensure to provide only URLs that is present on the knowledge base, if you don't know the url just say 'At the moment I don't have the correct url for you but I will make a note to my supervisor'."
            );
            baseConfig.chat_info.questions_flow = [`A customer support flow for ${companyName} involves understanding user needs, providing accurate information about our products and services, and ensuring timely resolution of any issues.`];
            baseConfig.bot_config.bot_goal = "qualify the customer based on what is a qualifying lead, You will qualify the customer and see if is a good fit for our service.";
            baseConfig.bot_config.bot_role = "Customer Support";
            return baseConfig;

        case "Lead Generation":
            baseConfig.chat_info.guidelines.extra_info.push(
                "Ensure to qualify the customer based on the qualified lead on question flow."
            );
            baseConfig.chat_info.questions_flow = what_is_a_qualified_lead || [];
            baseConfig.chat_info.qualification_questions = questionObjects;
            baseConfig.bot_config.bot_goal = "qualify the customer based on what is a qualifying lead, You will qualify the customer and see if is a good fit for our service.";
            baseConfig.bot_config.bot_role = "Lead Generation";
            return baseConfig;

        case "Appointment Setter":
            baseConfig.chat_info.guidelines.extra_info.push(
                "Ensure to qualify the customer based on the qualified lead on question flow.",
                "Ensure to book a call with the user if the user qualifies by asking when would be the best time to call? AM or PM."
            );
            baseConfig.chat_info.questions_flow = what_is_a_qualified_lead || [];
            baseConfig.chat_info.qualification_questions = questionObjects;
            baseConfig.bot_config.bot_goal = "qualify the customer based on what is a qualifying lead, You will qualify the customer and see if is a good fit for our service.";
            baseConfig.bot_config.bot_role = "Appointment Setter";
            return baseConfig;

        default:
            return {};
    }
}

/**
 * Gets chat widget configuration based on bot and company details
 * 
 * @param {string} botName - The name of the bot
 * @param {string} company_name - The name of the company
 * @param {string} intro_message - Custom introduction message (optional)
 * @returns {Object} - Complete chat widget configuration object
 */
export function getChatConfig(botName, company_name, intro_message) {
    return {
        global_: {
            showForm: false,
            businessDetails: {
                brandLogoImg: "",
                businessInfo: {
                    businessName: company_name,
                },
                brandDesign: {
                    primaryColor: "#000",
                    secondaryColor: "#FFFFFF",
                },
                chatConfig: {
                    botName: botName,
                    introMessage: intro_message || `Hi there 👋, I'm ${botName} from ${company_name}. How can I help you today?`,
                },
            },
        },
        avatar: {
            avatarImage: "",
        },
        form: {
            logo: "",
            title: `Welcome to ${company_name}'s Chat Support!`,
            description: "Please fill in the form below before starting the chat.",
            fields: {
                oneColumn: [
                    {
                        type: "email",
                        name: "email_address",
                        label: "Email address",
                        placeholder: "Email Address here...",
                        required: true,
                        pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}",
                    },
                ],
                twoColumn: {
                    name: [
                        {
                            type: "text",
                            name: "first_name",
                            label: "First name",
                            placeholder: "First name here...",
                            required: true,
                            pattern: "[a-zA-Z]",
                        },
                        {
                            type: "text",
                            name: "last_name",
                            label: "Last name",
                            placeholder: "Surname here...",
                            required: true,
                            pattern: "[a-zA-Z]",
                        },
                    ],
                },
            },
            button: {
                backgroundColor: "",
                textColor: "#FFFFFF",
                text: "Start Chatting",
                width: "100%",
                marginTop: "16px",
                marginBottom: "",
                marginLeft: "",
                marginRight: "",
                paddingTop: "",
                paddingBottom: "",
                paddingLeft: "",
                paddingRight: "",
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
            },
            showFooter: true,
        },
        chatWindow: {
            header: {
                logo: "",
                title: botName,
                status: "Online",
            },
            message: {
                bot: {
                    backgroundColor: "#eeeeee",
                    color: "#374151",
                    fontSize: "1rem",
                    botImage: "",
                },
                user: {
                    backgroundColor: "#000",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                },
            },
            footer: {
                button: {
                    backgroundColor: "#000",
                },
                showFooter: true,
            },
        },
    };
}

// ----------------------------------------------------------------- //
//Dynamic changes function
// ----------------------------------------------------------------- //
export const setValueAtPath = (obj, path, value) => {
    const keys = path.split(".");
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        if (Array.isArray(current[keys[i]])) {
            current = current[keys[i]][keys[++i]];
        } else {
            current = current[keys[i]];
        }
    }
    current[keys[keys.length - 1]] = value;
    return { ...obj };
};

