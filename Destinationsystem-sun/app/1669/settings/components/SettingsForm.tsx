// app/1669/settings/components/SettingsForm.tsx
"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@components/ui/form";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { PremiumSwitch } from "./PremiumSwitch";
import { Save, Loader2 } from "lucide-react";

interface SettingsFormProps {
  category: "profile" | "notification" | "system" | "communication" | "emergency" | "caseManagement" | "dashboard";
  onSubmit: (data: any) => void | Promise<void>;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const SettingsForm: React.FC<SettingsFormProps> = ({ category, onSubmit }) => {
  const form = useFormContext();

  if (!form) {
    return <div className="p-4 text-red-500 bg-red-50 rounded-md">เกิดข้อผิดพลาด: ไม่พบฟอร์มคอนเท็กซ์</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {category === "profile" && (
            <>
              <motion.div variants={item}>
                <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อจริง</FormLabel>
                    <FormControl>
                      <Input placeholder="ชื่อจริง" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>นามสกุล</FormLabel>
                    <FormControl>
                      <Input placeholder="นามสกุล" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input placeholder="+66XXXXXXXXX" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription>เบอร์โทรศัพท์สำหรับติดต่อฉุกเฉิน</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "notification" && (
            <>
              <motion.div variants={item}>
                <FormField control={form.control} name="emergencyAlerts" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">การแจ้งเตือนฉุกเฉิน</FormLabel>
                      <FormDescription>รับการแจ้งเตือนเหตุฉุกเฉินที่สำคัญทันที</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="statusUpdates" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">การอัปเดตสถานะ</FormLabel>
                      <FormDescription>รับการอัปเดตเมื่อสถานะเคสมีการเปลี่ยนแปลง</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="soundEnabled" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">เสียงแจ้งเตือน</FormLabel>
                      <FormDescription>เล่นเสียงเมื่อมีการแจ้งเตือนใหม่</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="emailNotifications" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">การแจ้งเตือนทางอีเมล</FormLabel>
                      <FormDescription>ส่งสำเนาการแจ้งเตือนไปยังอีเมลของคุณ</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="smsNotifications" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">การแจ้งเตือนทาง SMS</FormLabel>
                      <FormDescription>รับข้อความ SMS สำหรับเหตุการณ์สำคัญ</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "system" && (
            <>

              <motion.div variants={item}>
                <FormField control={form.control} name="language" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ภาษาของระบบ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกภาษา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="th">ภาษาไทย</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="timeZone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>เขตเวลา</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกเขตเวลา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Asia/Bangkok">กรุงเทพ (GMT+7)</SelectItem>
                        <SelectItem value="Asia/Singapore">สิงคโปร์ (GMT+8)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="dateFormat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>รูปแบบวันที่</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกรูปแบบวันที่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="mapProvider" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ผู้ให้บริการแผนที่</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกผู้ให้บริการแผนที่" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="google">Google Maps</SelectItem>
                        <SelectItem value="here">HERE Maps</SelectItem>
                        <SelectItem value="osm">OpenStreetMap</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="autoRefreshInterval" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ช่วงเวลาการรีเฟรชอัตโนมัติ (วินาที)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกช่วงเวลาการรีเฟรช" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 วินาที</SelectItem>
                        <SelectItem value="30">30 วินาที</SelectItem>
                        <SelectItem value="60">1 นาที</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "communication" && (
            <>
              <motion.div variants={item}>
                <FormField control={form.control} name="primaryContactNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเลขติดต่อหลัก</FormLabel>
                    <FormControl>
                      <Input placeholder="+66 2 XXX XXXX" {...field} className="h-11" />
                    </FormControl>
                    <FormDescription>เบอร์โทรศัพท์หลักสำหรับศูนย์สั่งการ</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="backupContactNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเลขติดต่อสำรอง</FormLabel>
                    <FormControl>
                      <Input placeholder="+66 2 XXX XXXX" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="emergencyEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>อีเมลฉุกเฉิน</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="emergency@example.com" {...field} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="broadcastChannel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ช่องทางการกระจายเสียง</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกช่องทางการกระจายเสียง" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="primary">เครือข่ายหลัก (Primary)</SelectItem>
                        <SelectItem value="secondary">เครือข่ายรอง (Secondary)</SelectItem>
                        <SelectItem value="both">ทั้งสองเครือข่าย (Both)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "emergency" && (
            <>
              <motion.div variants={item}>
                <FormField control={form.control} name="defaultRadius" render={({ field }) => (
                  <FormItem>
                    <FormLabel>รัศมีการค้นหาเริ่มต้น (กิโลเมตร)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(+e.target.value)} className="h-11" />
                    </FormControl>
                    <FormDescription>ระยะทางเริ่มต้นในการค้นหาหน่วยกู้ภัยใกล้เคียง</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="minUrgencyLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>ระดับความเร่งด่วนขั้นต่ำสำหรับแจ้งเตือน</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกระดับความเร่งด่วน" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CRITICAL">วิกฤติ (Critical)</SelectItem>
                        <SelectItem value="URGENT">เร่งด่วน (Urgent)</SelectItem>
                        <SelectItem value="NON_URGENT">ไม่เร่งด่วน (Non-Urgent)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "caseManagement" && (
            <>
               <motion.div variants={item}>
                <FormField control={form.control} name="autoForward" render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">ส่งต่อเคสอัตโนมัติ (Auto-forward)</FormLabel>
                      <FormDescription>ส่งเคสไปยังโรงพยาบาลที่ใกล้ที่สุดโดยอัตโนมัติ</FormDescription>
                    </div>
                    <FormControl>
                      <PremiumSwitch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="slaResponseTime" render={({ field }) => (
                  <FormItem>
                    <FormLabel>SLA: เวลาตอบกลับสูงสุด (นาที)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} onChange={(e) => field.onChange(+e.target.value)} className="h-11" />
                    </FormControl>
                    <FormDescription>เวลาที่กำหนดให้ทีมกู้ภัยต้องตอบรับงาน</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}

          {category === "dashboard" && (
            <>
               <motion.div variants={item}>
                <FormField control={form.control} name="layout" render={({ field }) => (
                  <FormItem>
                    <FormLabel>รูปแบบการแสดงผล (Layout)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกรูปแบบ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">มาตรฐาน (Standard)</SelectItem>
                        <SelectItem value="compact">กะทัดรัด (Compact)</SelectItem>
                        <SelectItem value="map-focused">เน้นแผนที่ (Map Focused)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
              <motion.div variants={item}>
                <FormField control={form.control} name="refreshInterval" render={({ field }) => (
                  <FormItem>
                    <FormLabel>รีเฟรชข้อมูลอัตโนมัติ</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="เลือกเวลา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">ทุก 5 วินาที</SelectItem>
                        <SelectItem value="10">ทุก 10 วินาที</SelectItem>
                        <SelectItem value="30">ทุก 30 วินาที</SelectItem>
                        <SelectItem value="60">ทุก 1 นาที</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </motion.div>
            </>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto min-w-[150px] h-11 text-base">
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
};
