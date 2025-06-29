import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageProps } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getDetailedLocation, formatLocationString, getLocationMetadata } from '@/lib/location-utils';

const formSchema = z.object({
    date: z.string(),
    check_out_time: z.string(),
    check_out_location: z.string().min(2, {
        message: 'Location must be at least 2 characters.',
    }),
    photo: z.string().min(1, {
        message: 'Face photo is required.',
    }),
    notes: z.string().optional(),
    // Advanced location data
    accuracy: z.number().optional(),
    altitude: z.number().optional(),
    speed: z.number().optional(),
    is_mocked: z.string().optional(),
    device_time: z.number().optional(),
    device_id: z.string().optional(),
    has_sensors: z.string().optional(),
    network_type: z.string().optional(),
});

export function CheckoutForm({
    className,
}: PageProps<{
    className?: string;
}>) {
    const { errors } = usePage().props;
    const [locationError, setLocationError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState('');
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [photoTaken, setPhotoTaken] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            check_out_time: new Date().toTimeString().split(' ')[0],
            check_out_location: '',
            photo: '',
            notes: '',
        },
    });

    // Get current location when component mounts
    useEffect(() => {
        getAdvancedLocation();
        
        // Initialize camera
        initCamera();

        // Cleanup function to stop camera when component unmounts
        return () => {
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    const getAdvancedLocation = async () => {
        try {
            setIsLoading(true);
            setLocationError('');
            
            // Get detailed location with anti-spoofing measures
            const locationData = await getDetailedLocation();
            
            // Set the location string
            const locationString = formatLocationString(locationData);
            form.setValue('check_out_location', locationString);
            
            // Set additional location metadata
            const metadata = getLocationMetadata(locationData);
            Object.entries(metadata).forEach(([key, value]) => {
                // @ts-expect-error - Dynamic form field setting
                form.setValue(key, value);
            });
            
            // Check if location is potentially mocked
            if (locationData.isMocked) {
                setLocationError('Warning: Your location appears to be mocked. This may prevent check-out.');
            }
            
            setIsLoading(false);
        } catch (error) {
            console.error('Error getting location:', error);
            setLocationError('Unable to get your current location. Please enable location services and try again.');
            setIsLoading(false);
        }
    };

    const initCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: "user" 
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraReady(true);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError('Unable to access camera. Please allow camera access to continue.');
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current && isCameraReady) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                // Set canvas dimensions to match video but smaller for optimization
                const width = 320; // Smaller width for optimization
                const height = videoRef.current.videoHeight * (width / videoRef.current.videoWidth);
                
                canvasRef.current.width = width;
                canvasRef.current.height = height;
                
                // Draw video frame to canvas with resized dimensions
                context.drawImage(videoRef.current, 0, 0, width, height);
                
                // Convert canvas to base64 image with reduced quality
                const photoData = canvasRef.current.toDataURL('image/jpeg', 0.7); // 70% quality
                form.setValue('photo', photoData);
                setPhotoTaken(true);
            }
        }
    };

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('Submitting checkout form with values:', values);
        
        // Ensure date is in YYYY-MM-DD format
        const formattedValues = {
            ...values,
            date: new Date().toISOString().split('T')[0], // Ensure date is in YYYY-MM-DD format
        };
        
        console.log('Submitting with formatted values:', formattedValues);
        
        router.post('/user/attendances/checkout', formattedValues, {
            onSuccess: (page) => {
                console.log('Check-out recorded successfully.', page);
            },
            onError: (errors) => {
                console.error('Failed to check out. Errors:', errors);
            },
        });
    }

    const retryLocation = () => {
        getAdvancedLocation();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={`${className} space-y-6`}>
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                <Input type="date" {...field} disabled />
                            </FormControl>
                            <FormMessage>{errors.date}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="check_out_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Check-out Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} disabled />
                            </FormControl>
                            <FormMessage>{errors.check_out_time}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="check_out_location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <div className="flex gap-2">
                                <FormControl className="flex-1">
                                    <Input 
                                        {...field} 
                                        disabled 
                                        placeholder={isLoading ? "Getting your location..." : "Location coordinates"}
                                    />
                                </FormControl>
                                <Button 
                                    type="button" 
                                    onClick={retryLocation} 
                                    disabled={isLoading}
                                    size="icon"
                                >
                                    ↻
                                </Button>
                            </div>
                            {locationError && <p className="text-sm text-red-500">{locationError}</p>}
                            <FormMessage>{errors.check_out_location}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="photo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Face Photo</FormLabel>
                            <FormControl>
                                <div className="space-y-4">
                                    {cameraError ? (
                                        <Alert variant="destructive">
                                            <AlertDescription>{cameraError}</AlertDescription>
                                        </Alert>
                                    ) : (
                                        <Card>
                                            <CardContent className="p-4 space-y-4">
                                                <div className="relative bg-black rounded-lg overflow-hidden">
                                                    <video 
                                                        ref={videoRef} 
                                                        autoPlay 
                                                        playsInline 
                                                        muted 
                                                        className="w-full h-auto"
                                                    />
                                                </div>
                                                <canvas ref={canvasRef} className="hidden" />
                                                <Button 
                                                    type="button" 
                                                    onClick={capturePhoto} 
                                                    disabled={!isCameraReady}
                                                    className="w-full"
                                                >
                                                    Capture Photo
                                                </Button>
                                                {photoTaken && (
                                                    <div className="mt-2">
                                                        <p className="text-sm text-green-600">Photo captured successfully!</p>
                                                        <div className="mt-2 border rounded-lg overflow-hidden">
                                                            <img 
                                                                src={field.value} 
                                                                alt="Captured face" 
                                                                className="w-full h-auto"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )}
                                    <input type="hidden" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage>{errors.photo}</FormMessage>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea 
                                    placeholder="Add any notes about your check-out" 
                                    className="resize-none" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage>{errors.notes}</FormMessage>
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isLoading || !photoTaken || !form.getValues('check_out_location')}>
                    {isLoading ? 'Loading...' : 'Check Out'}
                </Button>
            </form>
        </Form>
    );
}
