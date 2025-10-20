// ReactSelect + custom components 
import ReactSelect, { components } from 'react-select';

export const CustomOption = (props) => {
    return (
        <components.Option {...props}>
            <div className="flex flex-col">
                <span>{props.data.label}</span>
                {props.data.botName && (
                    <span className="text-sm text-gray-500">{props.data.botName}</span>
                )}
            </div>
        </components.Option>
    );
};

export const CustomSingleValue = (props) => {
    return (
        <components.SingleValue {...props}>
            <div className="flex flex-col">
                <span>{props.data.label}</span>
                {props.data.botName && (
                    <span className="text-sm text-gray-500">{props.data.botName}</span>
                )}
            </div>
        </components.SingleValue>
    );
};

export const filterOption = (option, inputValue) => {
    return (
        option.data.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.data.botName.toLowerCase().includes(inputValue.toLowerCase())
    );
};

// Helper function to prepend "All Chats" option
export const getChatOptions = (chatDetails) => {
    const allChatsOption = {
        value: null, // or "all" if you prefer, as long as your logic handles it
        label: "All Chats",
        botName: "", // optional, can be left empty
    };
    return [allChatsOption, ...chatDetails];
};
