import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Input, Button, Card, CardBody, CardHeader, Divider } from "@heroui/react"
import { Lock, Save } from 'lucide-react'
import { toast } from 'sonner'
import { getAuthError } from '../utils/errorMessages'

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setIsLoading(true)
    try {
      await updatePassword(newPassword)
      toast.success('Password updated successfully!')
      navigate('/login')
    } catch (error) {
      toast.error(getAuthError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-white px-4 py-6">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <img
            className="w-[80px] mx-auto mb-4"
            src="Olivia-ai-LOGO.png"
            alt="Olivia AI Network"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Set new password
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Choose a strong password to secure your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Input
            type="password"
            label="New Password"
            labelPlacement="outside"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            endContent={<Lock className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />
          <Input
            type="password"
            label="Confirm Password"
            labelPlacement="outside"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            endContent={<Lock className="w-4 h-4 text-gray-400" />}
            isDisabled={isLoading}
            classNames={{
              input: "transition-all duration-250",
              inputWrapper: "transition-all duration-250 bg-gray-100 bg-white border border-gray-300 text-gray-700 shadow-none py-6",
            }}
            required
          />

          <Button
            type="submit"
            className="w-full bg-brand text-gray-900 font-semibold hover:opacity-90 transition-all duration-200 min-h-[48px]"
            endContent={<Save className="w-4 h-4" />}
            isLoading={isLoading}
            size="lg"
          >
            Update password
          </Button>
        </form>
      </div>
    </div>
  )
}
