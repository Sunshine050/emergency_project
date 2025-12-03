// app/shared/utils/extractors.ts
// Existing + for reports
export const extractLocationFromDescription = (description?: string): string => {
  if (!description) return "ไม่ระบุ";
  const match = description.match(/หน้าบ้านเลขที่\s*(\d+(?:\/\d+)?)/i);
  if (match) return `หน้าบ้านเลขที่ ${match[1]}`;
  const addressMatch = description.match(/(?:ที่|สถานที่|บ้าน|ซอย|ถนน|หมู่)\s*[^.,\s]*\s*(\d+(?:\/\d+)?(?:[^.,\s]*)?)/i);
  return addressMatch ? addressMatch[0] : "ไม่ระบุ";
};

export const extractSymptomsFromDescription = (description?: string): string => {
  if (!description) return "ไม่ระบุ";
  const symptomMatch = description.match(/ผู้ป่วย\s*(.*?)(?:\s*ไม่ทราบสาเหตุ|\s*$)/i);
  if (symptomMatch && symptomMatch[1].trim()) return symptomMatch[1].trim();
  const simpleMatch = description.match(/ผู้ป่วย\s*(.*?)(?=\.|,|$)/i);
  return simpleMatch && simpleMatch[1].trim() ? simpleMatch[1].trim() : "ไม่ระบุ";
};

export const getLocationText = (details?: any): string => details?.location?.address || details?.location || extractLocationFromDescription(details?.description);

export const getSymptomsText = (details?: any): string | string[] => {
  if (Array.isArray(details?.symptoms)) return details.symptoms;
  if (details?.symptoms) return details.symptoms;
  return extractSymptomsFromDescription(details?.description);
};

// Existing...