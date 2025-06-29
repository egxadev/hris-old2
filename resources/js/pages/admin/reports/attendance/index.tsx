import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Download, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, isValid, parseISO } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import axios, { AxiosError } from 'axios';
import { Attendance } from '@/types/attendance';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface ErrorResponse {
  message: string;
}

export default function Index() {
  const { breadcrumbs } = usePage<{
    breadcrumbs: BreadcrumbItem[];
  }>().props;
  
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Attendance[]>([]);
  const [exporting, setExporting] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/admin/reports/attendance/data', {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      });

      setData(response.data.data);
      console.log('Attendance data:', response.data.data);
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponse>;
      setError(error.response?.data?.message || 'Failed to fetch attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    setExporting(true);
    
    try {
      const response = await axios.post('/admin/reports/attendance/export-pdf', {
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
      }, {
        responseType: 'blob',
      });
      
      // Create a blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}.pdf`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
      
    } catch (err: unknown) {
      const error = err as Error;
      setError('Failed to export PDF');
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Safe date formatting function
  const safeFormatDate = (dateString: string | null, formatStr: string): string => {
    if (!dateString) return '-';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, formatStr) : '-';
    } catch (error) {
      console.error('Invalid date:', dateString, error);
      return '-';
    }
  };

  // Safe time formatting function
  const safeFormatTime = (timeString: string | null, formatStr: string): string => {
    if (!timeString) return '-';
    try {
      // For time strings like "11:41:46" without date part
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, seconds);
      return isValid(date) ? format(date, formatStr) : '-';
    } catch (error) {
      console.error('Invalid time:', timeString, error);
      return '-';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={breadcrumbs[0].title} />
      
      <div className="flex h-full flex-1 flex-col gap-4 p-4 overflow-x-auto">
        <Card>
          <CardHeader>
            <CardTitle>Filter Report</CardTitle>
            <CardDescription>Select date range to generate attendance report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="flex items-end">
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          
          {data.length > 0 && (
            <CardFooter className="flex justify-end border-t p-4">
              <Button onClick={handleExportPdf} disabled={exporting}>
                <Download className="mr-2 h-4 w-4" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {loading ? (
          <div className="mt-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : data.length > 0 ? (
          <Card className="mt-2">
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
              <CardDescription>
                Showing results from {format(startDate!, 'PPP')} to {format(endDate!, 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Work Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((attendance, index) => (
                      <TableRow key={attendance.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{safeFormatDate(attendance.date, 'dd/MM/yyyy')}</TableCell>
                        <TableCell>{attendance.employee.employee_code}</TableCell>
                        <TableCell>{attendance.employee.user.name}</TableCell>
                        <TableCell>{attendance.employee.department?.name || '-'}</TableCell>
                        <TableCell>{attendance.employee.position?.name || '-'}</TableCell>
                        <TableCell>
                          {safeFormatTime(attendance.check_in_time, 'HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          {safeFormatTime(attendance.check_out_time, 'HH:mm:ss')}
                        </TableCell>
                        <TableCell>{attendance.status}</TableCell>
                        <TableCell>
                          {attendance.worked_minutes 
                            ? formatDuration(attendance.worked_minutes)
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
} 