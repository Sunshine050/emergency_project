// app/1669/hospitals/components/HospitalForm.tsx
import { useState } from "react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { createHospital } from "@/shared/services/hospitalService";
import { useToast } from "@/shared/hooks/use-toast";
import { Hospital } from "@/shared/types";

/**
 * A compact, well‑styled form for creating / editing a hospital.
 * It covers the essential fields without overwhelming the user.
 */
export const HospitalForm: React.FC<{ onSuccess?: (hospital: Hospital) => void }> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    contactPhone: "",
    contactEmail: "",
    totalBeds: "",
    availableBeds: "",
    icuBeds: "",
    availableIcuBeds: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        postalCode: form.postalCode,
        latitude: Number(form.latitude) || undefined,
        longitude: Number(form.longitude) || undefined,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail || undefined,
        totalBeds: Number(form.totalBeds) || undefined,
        availableBeds: Number(form.availableBeds) || undefined,
        icuBeds: Number(form.icuBeds) || undefined,
        availableIcuBeds: Number(form.availableIcuBeds) || undefined,
      };
      const newHospital = await createHospital(payload);
      toast({
        title: "สร้างโรงพยาบาลสำเร็จ",
        description: `${newHospital.name} ถูกเพิ่มเข้าในระบบ`,
      });
      onSuccess?.(newHospital);
    } catch (error) {
      console.error(error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถสร้างโรงพยาบาลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto shadow-lg">
      <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <CardTitle className="text-lg font-semibold">เพิ่มข้อมูลโรงพยาบาล</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {/* Basic info */}
          <Input name="name" placeholder="ชื่อโรงพยาบาล" value={form.name} onChange={handleChange} required />
          <Input name="address" placeholder="ที่อยู่" value={form.address} onChange={handleChange} required />
          <div className="grid grid-cols-2 gap-2">
            <Input name="city" placeholder="เมือง/จังหวัด" value={form.city} onChange={handleChange} required />
            <Input name="postalCode" placeholder="รหัสไปรษณีย์" value={form.postalCode} onChange={handleChange} />
          </div>
          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-2">
            <Input name="latitude" placeholder="ละติจูด" value={form.latitude} onChange={handleChange} type="number" step="any" />
            <Input name="longitude" placeholder="ลองจิจูด" value={form.longitude} onChange={handleChange} type="number" step="any" />
          </div>
          {/* Contact */}
          <Input name="contactPhone" placeholder="เบอร์โทรศัพท์" value={form.contactPhone} onChange={handleChange} />
          <Input name="contactEmail" placeholder="อีเมล" value={form.contactEmail} onChange={handleChange} type="email" />
          {/* Bed capacity */}
          <div className="grid grid-cols-2 gap-2">
            <Input name="totalBeds" placeholder="จำนวนเตียงทั้งหมด" value={form.totalBeds} onChange={handleChange} type="number" />
            <Input name="availableBeds" placeholder="เตียงว่าง" value={form.availableBeds} onChange={handleChange} type="number" />
          </div>
          {/* ICU capacity */}
          <div className="grid grid-cols-2 gap-2">
            <Input name="icuBeds" placeholder="จำนวนเตียง ICU ทั้งหมด" value={form.icuBeds} onChange={handleChange} type="number" />
            <Input name="availableIcuBeds" placeholder="เตียง ICU ว่าง" value={form.availableIcuBeds} onChange={handleChange} type="number" />
          </div>
          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "กำลังบันทึก…" : "บันทึกโรงพยาบาล"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
