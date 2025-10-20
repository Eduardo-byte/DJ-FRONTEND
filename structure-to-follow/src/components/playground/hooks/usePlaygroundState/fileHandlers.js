import { useRef } from "react";
import { agentConfigService } from "../../../../api/services/agentConfig.service";
import { chatService } from "../../../../api/services/chat.service";
import { chatConfigService } from "../../../../api/services/chatConfig.service";
import { supabase } from "../../../../lib/supabase";
import { setValueAtPath } from "../../../../utils/chatUtils";
import { webhookService } from "../../../../api/services/webhook.service";
import { toast } from "sonner";

export const useFileHandlers = (selectedAgent, setSelectedAgent, setAvatarImage, setSaveAvatarImage, avatarImage, saveAvatarImage, webhook, deployChannelConfigs, channelConfigs, setErrors) => {

  const uploadFileToSupabase = async (file, filename) => {
    // console.log("file", file);
    // console.log("filename", filename);
    const { data, error } = await supabase.storage
      .from('avatars') // Ensure this is the correct bucket name
      .upload(filename, file, { upsert: true }); // Enable upsert

    if (error) {
      throw new Error(error.message);
    }

    const url = `https://sasrqcnrvbodywiqeueb.supabase.co/storage/v1/object/public/avatars/${filename}`;
    return url;
  };

  const saveAvatarImageRef = useRef(null);

  // Handle file upload for avatar
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setErrors && setErrors(prev => ({
        ...prev,
        avatar: "Please select an image file"
      }));
      return;
    }
    if (file && file.size <= 1024 * 1024) { // 1MB limit
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarImage(reader.result);
        setSaveAvatarImage(file);
        saveAvatarImageRef.current = file;
      };
      reader.readAsDataURL(file);
      const extension = file.name.split('.').pop();
      const newPath = `avatar_${selectedAgent.id}_${selectedAgent.clientId}.${extension}`;
      let updatedOriginalData = selectedAgent.originalData;
      let updatedChatConfig = selectedAgent.chatConfig;
      updatedOriginalData = setValueAtPath(updatedOriginalData, "chat_config.avatar.avatarImage", `https://sasrqcnrvbodywiqeueb.supabase.co/storage/v1/object/public/avatars/${newPath}`);
      if (selectedAgent.chatConfig) {
        updatedChatConfig = setValueAtPath(updatedChatConfig, "avatar.avatarImage", `https://sasrqcnrvbodywiqeueb.supabase.co/storage/v1/object/public/avatars/${newPath}`);
      }
      setSelectedAgent({ ...selectedAgent, originalData: updatedOriginalData, chatConfig: updatedChatConfig });
    } else if (file) {
      // alert("File size should not exceed 1MB");
      toast.warning("File size should not exceed 1MB");
    }
  };

  // Handle applying changes - > this is to save the playground
  const handleApplyChanges = async (isDeploying) => {

    if (isDeploying) {
      console.log("I'm deploying");
    }
    else {
      console.log("I'm not deploying");
      try {
        //if is not deploying then should save what as been done under the channels tab of playground
        await deployChannelConfigs({ agent: selectedAgent, channelConfigs })
      } catch (error) {
        console.log("Error saving channels", error);
        return
      }
    }
    // alert("Changes applied successfully!");
    if (saveAvatarImage) {
      // console.log("saveAvatarImage", saveAvatarImage);
      const extension = saveAvatarImage.name.split('.').pop();
      const newPath = `avatar_${selectedAgent.id}_${selectedAgent.clientId}.${extension}`;
      await uploadFileToSupabase(saveAvatarImage, newPath);
    } else if (saveAvatarImageRef.current) {
      const extension = saveAvatarImageRef.current.name.split('.').pop();
      const newPath = `avatar_${selectedAgent.id}_${selectedAgent.clientId}.${extension}`;
      await uploadFileToSupabase(saveAvatarImageRef.current, newPath);
    }
    // console.log("selectedAgent on the handle applyu changes", selectedAgent);

    const updatedOriginalData = {
      ...selectedAgent.originalData,
      ...(isDeploying ? { status: true } : {}),
    };

    //use chatConfig service or do durectly inside the update chat
    // const updatedAgentResponse = await chatService.updateAgent(selectedAgent.id, selectedAgent.originalData);
    const updatedAgentResponse = await chatService.updateAgent(selectedAgent.id, updatedOriginalData);
    //here
    // console.log("selectedAgent:", selectedAgent);
    // console.log("selectedAgent.agentConfig", selectedAgent.agentConfig);
    let updatedAgentConfigResponse
    let updatedChatConfigResponse
    let updatedWebhookData

    if (selectedAgent.agentConfig) {
      updatedAgentConfigResponse = await agentConfigService.updateAgentConfig(selectedAgent.agentConfig.id, selectedAgent.agentConfig)
    }
    if (selectedAgent.chatConfig) {
      updatedChatConfigResponse = await chatConfigService.updateChatConfig(selectedAgent.chatConfig.id, selectedAgent.chatConfig)
    }
    if (selectedAgent.webhooksData) {
      updatedWebhookData = await webhookService.updateWebhook(selectedAgent.webhooksData.webhook_id, { endpoint_url: webhook })
    } else {
      if (webhook) {
        // console.log("Im  creating");
        const payload = {
          client_id: selectedAgent.clientId,
          chat_id: selectedAgent.id,
          name: selectedAgent.id,
          endpoint_url: webhook,
          trigger_event: "POST",
          is_active: true,
          retries_count: 0
        }
        await webhookService.createWebhook(payload)
      }
    }

    // Assuming updatedAgentResponse is an array and the first element contains the updated data
    const updatedData = updatedAgentResponse;
    const updatedChatConfig = updatedChatConfigResponse;
    const updatedAgentConfig = updatedAgentConfigResponse;

    // Derive updated name and description from the updated data if needed
    //This is for the dropdown with all agents and to set the selected agent with the new changes
    const updatedName =
      updatedData.chat_config?.global_?.businessDetails?.chatConfig?.botName ||
      updatedData.ai_config?.bot_config?.bot_name || updatedChatConfig?.global_?.businessDetails?.chatConfig?.botName || updatedChatConfig?.bot_config?.bot_name || selectedAgent.name;
    const updatedDescription =
      updatedData.ai_config?.bot_config?.bot_role || updatedAgentConfig?.bot_config?.bot_role || selectedAgent.description;

    // Update the state with the new data including top-level fields
    setSelectedAgent({
      ...selectedAgent,
      originalData: updatedData,
      name: updatedName,
      description: updatedDescription,
      chatConfig: updatedChatConfig,
      agentConfig: updatedAgentConfig,
      webhooksData: updatedWebhookData
    });
    toast.success("Your changes have been applied successfully")
  };

  return {
    uploadFileToSupabase,
    handleFileUpload,
    handleApplyChanges
  };
};
