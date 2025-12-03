"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { Label } from "@components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, Plus, Trash2, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastSignIn: string | null;
}

export const StaffManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // New User Form State
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "staff"
  });

  // API URL for the temp auth server
  const AUTH_API_URL = "http://localhost:3002";

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${AUTH_API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายชื่อพนักงานได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${AUTH_API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      toast({
        title: "สำเร็จ",
        description: "เพิ่มพนักงานเรียบร้อยแล้ว",
      });

      setIsDialogOpen(false);
      setNewUser({ email: "", password: "", firstName: "", lastName: "", role: "staff" });
      fetchUsers();
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: error.message || "ไม่สามารถเพิ่มพนักงานได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${AUTH_API_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast({
        title: "สำเร็จ",
        description: "ลบพนักงานเรียบร้อยแล้ว",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถลบพนักงานได้",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            จัดการพนักงาน (Staff Management)
          </CardTitle>
          <CardDescription>เพิ่ม ลบ และจัดการสิทธิ์การใช้งานของเจ้าหน้าที่</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
              <DialogDescription>
                กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้งานสำหรับเจ้าหน้าที่
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อจริง</Label>
                  <Input 
                    id="firstName" 
                    value={newUser.firstName} 
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input 
                    id="lastName" 
                    value={newUser.lastName} 
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={newUser.email} 
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={newUser.password} 
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">บทบาท (Role)</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกบทบาท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">เจ้าหน้าที่ทั่วไป (Staff)</SelectItem>
                    <SelectItem value="supervisor">หัวหน้างาน (Supervisor)</SelectItem>
                    <SelectItem value="admin">ผู้ดูแลระบบ (Admin)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  บันทึกข้อมูล
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ-นามสกุล</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>บทบาท</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลพนักงาน
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'supervisor' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' :
                           user.role === 'supervisor' ? 'Supervisor' : 'Operator'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), 'dd MMM yyyy', { locale: th }) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
