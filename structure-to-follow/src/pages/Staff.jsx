import { useState, useEffect, useContext, useMemo } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import dayjs from "dayjs";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip,
  Card,
  CardHeader,
  CardBody,
  Divider,
} from "@heroui/react";
import { UserPlus, Mail, User, Trash2, Eye, EyeOff, Users, Edit } from "lucide-react";
import { supabase } from "../lib/supabase";
import { UserDataContext } from "../context/UserDataContext";
import SetStaffPassword from "../components/registerStaff/SetStaffPassword";
import { supabase_v2 } from "../lib/supabaseClient2";
import { staffService } from "../api/services/staff.service";
import Joyride from "react-joyride";
import useTourController from "../Demo/utils/useTourController";
import { teamSteps } from '../Demo/Profile/team.demo'
import MyCustomTooltip from '../Demo/CustomTooltip/MyCustomTooltip';


export default function Staff() {
  // Get user data from context (and your custom hook)
  const { userData, isStaff, loggedInUser } = useContext(UserDataContext);
  const currentUserCookie = userData;
  const navigate = useNavigate();

  // Flag to control super admin UI (if needed)
  const [showSuperAdminTab, setShowSuperAdminTab] = useState(false);
  // Refresh trigger for re-fetching staff data
  const [refreshData, setRefreshData] = useState(false);
  // Staff members fetched from the API
  const [staffMembers, setStaffMembers] = useState([]);
  // Modal open state for the invite form
  const [isOpen, setIsOpen] = useState(false);
  // Modal open state for the edit form
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Staff member being edited
  const [editingStaff, setEditingStaff] = useState(null);
  // For toggling password visibility if needed
  const [isVisible, setIsVisible] = useState(true);

  // Use the custom hook for tour control
  const { runTour, handleJoyrideCallback } = useTourController("team", loggedInUser);

  // Fix dropdown z-index by targeting the portal wrapper
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Target HeroUI dropdown portal wrapper directly */
      div[style*="position: absolute"][style*="z-index"] {
        z-index: 2147483647 !important;
      }
      
      /* More specific targeting for dropdowns */
      div[style*="position: absolute"][data-slot="base"][role="dialog"] {
        z-index: 2147483647 !important;
      }
      
      /* Target the parent wrapper */
      div[style*="position: absolute"] > div[style*="opacity"][style*="transform"] {
        z-index: 2147483647 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Determine admin's client ID from context/hook
  // If current user is staff, we need to get the original owner's client_id
  // If current user is the owner, use their client_id directly
  const adminClientId = useMemo(() => {
    // If this is a staff member, get the client_id from the staff table
    // which should point to the original owner
    if (isStaff) {
      // For staff, the client_id in userData represents the owner they belong to
      return userData?.client_id;
    }
    // For owners, use their own client_id
    return currentUserCookie?.userData?.client_id || userData?.client_id;
  }, [currentUserCookie?.userData?.client_id, userData?.client_id, isStaff]);

  // Set the super admin flag based on the user role
  useEffect(() => {
    if (userData?.role === "Agency" || userData?.role === "God Mode") {
      setShowSuperAdminTab(userData.role === "God Mode");
    }
  }, [userData]);

  // Fetch staff members for the given client ID
  useEffect(() => {
    async function loadStaff() {
      if (!adminClientId) {
        // toast.error("Client ID is not available.");
        return;
      }
      const staffData = await staffService.fetchStaffByClientId(
        adminClientId,
      );
      if (staffData && staffData.length > 0) {
        setStaffMembers(staffData);
      } else {
        setStaffMembers([]);
        // toast.error("Failed to load staff data or no staff data available.");
      }
    }
    loadStaff();
  }, [adminClientId, refreshData]);

  // Generate a secure random password
  function generateSecurePassword(length = 18) {
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const symbols = "@#$%";
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = "";
    // Ensure at least one char of each type
    password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    // Shuffle and return with a prefix
    password = password.split("").sort(() => Math.random() - 0.5).join("");
    return `tp${password}`;
  }

  // Sign up a new user with Supabase
  async function signUpWithEmail(email, password) {
    // const { data, error } = await supabase_v2.auth.signUp({ email, password });
    // const { data, error } = await supabase_v2.auth.admin.createUser({ email, password });
    const { data, error } = await supabase_v2.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    return { data, error };
  }

  // Formik for the "Invite User" form
  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      role: "Standard", // Default role
      password: "", // Not collected from user; generated instead
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const randomPassword = generateSecurePassword();
        const signUpResponse = await signUpWithEmail(values.email, randomPassword);
        if (signUpResponse.error) {
          throw new Error(signUpResponse.error.message);
        }
        // console.log("signUpResponse.data.user.id: ", signUpResponse.data.user.id);
        // console.log("currentUserCookie:  ", currentUserCookie);
        const userId = signUpResponse.data.user.id;
        if (userId) {
          // Insert staff details into your database
          const insertResponse = await staffService.InsertStaffIntoSupabase(
            {
              name: values.name,
              email: values.email,
              client_id: adminClientId,
              authenticated_id: userId,
              account_status: "active",
              isFirstTimeUser: true,
              trial_start:
                currentUserCookie?.trial_start || userData?.trial_start,
              trial_end:
                currentUserCookie?.trial_end || userData?.trial_end,
              trial_message_count:
                currentUserCookie?.trial_message_count ||
                userData?.trial_message_count,
              trial_current_message_count:
                currentUserCookie?.trial_message_count ||
                userData?.trial_message_count,
              account_type: "pro",
              contact_name: values.name,
              role: values.role,
              company_name:
                currentUserCookie?.company_name || userData?.company_name,
              contact_email:
                currentUserCookie?.contact_email || userData?.contact_email,
            },
          );
          //console.log("insertResponse: ", insertResponse);
          if (insertResponse.error) {
            throw new Error(insertResponse.error.message);
          }
          const emailPayload = {
            recipient_email: values.email,
            temporary_password: randomPassword,
          };
          toast.success("Staff account has been successfully created.");
          await axios.post(
            `${import.meta.env.VITE_API_URL}/send-welcome-email`,
            emailPayload,
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            }
          );
          // Send a password reset email to let the new user set their own password
          // const resetPassword = await supabase_v2.auth.resetPasswordForEmail(values.email);
          //console.log("resetPassword:", resetPassword);
          setRefreshData((prev) => !prev);
          setIsOpen(false);
          resetForm();
        } else {
          toast.error("We're having technical issues. Please try again later.");
        }
      } catch (error) {
        let errorMessage = "Registration failed.";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        toast.error(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Formik for the "Edit Staff" form
  const editFormik = useFormik({
    initialValues: {
      role: "Standard",
    },
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (!editingStaff) return;
        
        const updateData = {
          role: values.role,
        };

        const response = await staffService.updateStaffInfo(editingStaff.staff_id, updateData);
        
        if (response.error) {
          throw new Error("Failed to update staff member");
        }

        toast.success("Staff member updated successfully!");
        setRefreshData((prev) => !prev);
        setIsEditOpen(false);
        setEditingStaff(null);
      } catch (error) {
        console.error("Error updating staff:", error);
        toast.error("Failed to update staff member");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Function to open edit modal
  const openEditModal = (staff) => {
    setEditingStaff(staff);
    editFormik.setValues({
      role: staff.role || "Standard",
    });
    setIsEditOpen(true);
  };

  // Optional: Toggle password visibility (if you ever include a password field)
  const toggleVisibility = () => setIsVisible(!isVisible);

  // Delete a staff member via your API
  async function deleteStaffMember(staff_id, authenticated_id) {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this staff member?"
    );
    if (!isConfirmed) return;
    try {
      const response = await staffService.staffMemberDelete(staff_id, authenticated_id)

      if (response.statusCode === 204 || response.statusCode === 200) {
        toast.success("Staff deleted successfully");
        const updatedStaffMembers = staffMembers.filter(
          (staff) => staff.staff_id !== staff_id
        );
        setStaffMembers(updatedStaffMembers);
      } else {
        toast.error("Failed to delete staff");
      }
    } catch (error) {
      console.error("Error deleting staff:", error);
      toast.error("An error occurred while deleting the staff.");
    }
  }

  // Send a password reset email to a staff member
  async function resetPasswordWithEmail(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_MAIN_DOMAIN}/update-password`,
    });
    return { data, error };
  }

  async function sendPasswordReset(email) {
    const { data, error } = await resetPasswordWithEmail(email);
    if (data) {
      toast.success(
        `Your reset password link was sent to ${email}. Please check your inbox ✉️`
      );
    } else if (error) {
      if (error.message === "Email not confirmed") {
        toast.warning(
          `Your email was not confirmed yet, please check your inbox ✉️`
        );
      } else if (error.message === "Invalid login credentials") {
        toast.error(
          `Your email is incorrect, please try again or contact our support!`
        );
      } else {
        console.error("Error resetting password:", error);
      }
    }
  }

  return (
    <div className="mt-6">
      {/* Joyride component at the top level - disabled for now 
      <Joyride
        showProgress={true}
        disableCloseOnEsc={true}
        disableOverlayClose={true}
        steps={teamSteps}
        run={runTour}
        scrollOffset={300}
        continuous={true}
        showSkipButton={true}
        tooltipComponent={MyCustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            zIndex: 10000,
          },
        }}
      />
      */}
      <Card className="w-full border-1 border-black/10 border-solid welcome" shadow="none">
        <CardHeader className="flex gap-3">
          <div className="p-2 rounded-lg bg-brand/10">
            <Users className="w-5 h-5 text-gray-900" />
          </div>
          <div className="flex flex-col">
            <p className="text-md font-semibold text-gray-900">
              Team Management
            </p>
            <p className="text-small text-gray-500">
              Invite team members and key contributors to assist managing this project
            </p>
          </div>
          <div className="ml-auto">
            <Button
              className="bg-gradient-to-r from-brand to-brand-secondary text-gray-900 font-medium invite"
              size="md"
              onPress={() => setIsOpen(true)}
              isDisabled={
                (isStaff && loggedInUser.role !== "Admin") ||
                (userData.account_type === "basic" && staffMembers.length == 1) ||
                (userData.account_type === "pro" && staffMembers.length >= 3) ||
                (userData.account_type === "advanced" && staffMembers.length >= 10)
              }
            >
              Invite User
            </Button>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="space-y-4">

          {/* Invite User Modal */}
          <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Invite User</ModalHeader>
                  <ModalBody>
                    <form className="space-y-6" onSubmit={formik.handleSubmit}>
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.name}
                          variant="bordered"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          variant="bordered"
                          required
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          value={formik.values.email}
                          radius="md"
                        />
                      </div>
                      <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <Select
                          id="role"
                          name="role"
                          variant="bordered"
                          selectedKeys={[formik.values.role]}
                          onSelectionChange={(selection) => {
                            const selectedRole = Array.from(selection)[0];
                            formik.setFieldValue("role", selectedRole);
                          }}
                          required
                        >
                          <SelectItem key="Standard" value="Standard">Standard</SelectItem>
                          <SelectItem key="Admin" value="Admin">Admin</SelectItem>
                        </Select>
                      </div>
                      {/*
                  Optionally, you can include a password field here.
                  The field below shows how to toggle visibility if needed.
                  <div className="w-full flex flex-col justify-end gap-2">
                    <Input
                      id="password"
                      name="password"
                      type={isVisible ? "text" : "password"}
                      required
                      onChange={formik.handleChange}
                      variant="bordered"
                      className="w-full"
                      startContent={
                        <button type="button" onClick={toggleVisibility}>
                          {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      }
                      radius="md"
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    <Button
                      size="sm"
                      onPress={() => {
                        const newPassword = generateSecurePassword();
                        formik.setFieldValue("password", newPassword);
                        toast.success("Secure password generated!");
                      }}
                    >
                      Generate Password
                    </Button>
                  </div>
                  */}
                      <div>
                        <Button
                          fullWidth
                          className="text-white bg-zinc-950"
                          type="submit"
                          disabled={formik.isSubmitting}
                        >
                          Register Staff
                        </Button>
                      </div>
                    </form>
                  </ModalBody>
                  <ModalFooter />
                </>
              )}
            </ModalContent>
          </Modal>

          {/* Edit Staff Modal */}
          <Modal isOpen={isEditOpen} onOpenChange={setIsEditOpen}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Edit Staff Member</ModalHeader>
                  <ModalBody>
                    <form className="space-y-6" onSubmit={editFormik.handleSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name (Read-only)
                        </label>
                        <Input
                          value={editingStaff?.name || ""}
                          variant="bordered"
                          isReadOnly
                          className="text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email (Read-only)
                        </label>
                        <Input
                          value={editingStaff?.email || ""}
                          variant="bordered"
                          isReadOnly
                          className="text-gray-600"
                        />
                      </div>
                      <div>
                        <label htmlFor="edit_role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <Select
                          id="edit_role"
                          name="role"
                          variant="bordered"
                          selectedKeys={[editFormik.values.role]}
                          onSelectionChange={(selection) => {
                            const selectedRole = Array.from(selection)[0];
                            editFormik.setFieldValue("role", selectedRole);
                          }}
                          required
                        >
                          <SelectItem key="Standard" value="Standard">Standard</SelectItem>
                          <SelectItem key="Admin" value="Admin">Admin</SelectItem>
                        </Select>
                      </div>
                      <div>
                        <Button
                          fullWidth
                          className="text-white bg-zinc-950"
                          type="submit"
                          disabled={editFormik.isSubmitting}
                        >
                          Update Staff
                        </Button>
                      </div>
                    </form>
                  </ModalBody>
                  <ModalFooter />
                </>
              )}
            </ModalContent>
          </Modal>

          <div className="max-w-full overflow-x-auto">
            <Table
              removeWrapper
              aria-label="Staff members table"
              classNames={{ wrapper: "min-w-[800px]" }}
            >
              <TableHeader>
                <TableColumn className="w-[180px]">CREATED AT</TableColumn>
                <TableColumn className="w-[150px]">NAME</TableColumn>
                <TableColumn className="w-[200px]">EMAIL</TableColumn>
                <TableColumn className="w-[100px]">ROLE</TableColumn>
                <TableColumn className="w-[100px]">STATUS</TableColumn>
                <TableColumn className="w-[300px]">Actions</TableColumn>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {dayjs(staff.created_at).format("DD/MM/YYYY hh:mm A")}
                    </TableCell>
                    <TableCell>{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      <Chip
                        color={staff.role === "Admin" ? "primary" : "default"}
                        className={
                          staff.role === "Admin" 
                            ? "bg-primary-500 bg-opacity-15 border-primary-500 border-solid border-[1px] text-primary-500 rounded-md"
                            : "bg-gray-500 bg-opacity-15 border-gray-500 border-solid border-[1px] text-gray-500 rounded-md"
                        }
                        variant="faded"
                        size="sm"
                      >
                        {staff.role || "Standard"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {staff.account_status === "inactive" ? (
                        <Chip
                          color="default"
                          className="bg-primary-500 bg-opacity-15 border-primary-500 border-solid border-[1px] text-primary-500 rounded-md"
                          variant="faded"
                          size="sm"
                        >
                          Pending...
                        </Chip>
                      ) : (
                        <Chip
                          color="success"
                          className="bg-success-500 bg-opacity-15 border-success-500 border-solid border-[1px] rounded-md"
                          variant="faded"
                          size="sm"
                        >
                          Active
                        </Chip>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="bordered"
                          size="sm"
                          onPress={() => sendPasswordReset(staff.email)}
                          isDisabled={
                            (isStaff && loggedInUser.role !== "Admin") ||
                            staff.email === loggedInUser.email
                          }
                        >
                          Resend
                        </Button>
                        <SetStaffPassword 
                          staff={staff} 
                          isStaff={
                            (isStaff && loggedInUser.role !== "Admin") ||
                            staff.email === loggedInUser.email
                          } 
                        />
                        <Button
                          isIconOnly
                          variant="bordered"
                          size="sm"
                          onPress={() => openEditModal(staff)}
                          isDisabled={
                            (isStaff && loggedInUser.role !== "Admin") ||
                            staff.email === loggedInUser.email
                          }
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          className="bg-opacity-0 border-2 hover:text-danger-500 hover:border-danger-500"
                          onPress={() =>
                            deleteStaffMember(staff.staff_id, staff.authenticated_id)
                          }
                          isDisabled={
                            (isStaff && loggedInUser.role !== "Admin") ||
                            staff.authenticated_id === loggedInUser.authenticated_id ||
                            staff.email === loggedInUser.email
                          }
                        >
                          <Trash2 size={16} style={{ cursor: "pointer" }} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
