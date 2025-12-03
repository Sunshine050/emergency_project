import { EmergencyCase } from '../hooks/useRescueCases';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card';
import { MapPin, Phone, User, AlertCircle } from 'lucide-react';

interface RescueCaseCardProps extends EmergencyCase {
  onComplete: () => void;
  onCancel: () => void;
}

const severityColors = {
  1: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
  2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
  3: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-500',
  4: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500',
};

export default function RescueCaseCard({
  id,
  title,
  status,
  severity,
  patientName,
  contactNumber,
  emergencyType,
  location,
  description,
  symptoms,
  onComplete,
  onCancel,
}: RescueCaseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <span className="font-mono text-sm">{id}</span>
            </CardDescription>
          </div>
          <Badge className={severityColors[severity]}>
            Grade {severity}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" />
            <span>{patientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-500" />
            <span>{contactNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-slate-500" />
            <span>{emergencyType}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-500" />
            <span className="text-xs">{location.address}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>

        <div className="flex flex-wrap gap-1">
          {symptoms.map((symptom, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {symptom}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          {status === 'in-progress' && (
            <>
              <Button size="sm" onClick={onComplete} className="flex-1">
                Complete Mission
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </>
          )}
          {status === 'completed' && (
            <Badge variant="secondary" className="w-full justify-center">
              Mission Completed
            </Badge>
          )}
          {status === 'cancelled' && (
            <Badge variant="destructive" className="w-full justify-center">
              Mission Cancelled
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}