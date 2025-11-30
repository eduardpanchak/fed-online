import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService, dbService, storageService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
import LocationPicker from '@/components/LocationPicker';

export default function AddService() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'repair', // Default category
    address: '',
    price: '',
    website: '',
    phone: '',
    email: '',
    subscriptionTier: 'standard' as 'standard' | 'top', // Default to standard
  });
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast.error('You must be logged in to upload photos');
      navigate('/auth');
      return;
    }

    // Verify user is authenticated
    const { session } = await authService.getSession();
    if (!session) {
      toast.error('Session expired. Please log in again.');
      navigate('/auth');
      return;
    }

    // Start upload immediately
    setIsUploadingPhoto(true);
    setSelectedPhoto(file);
    
    try {
      const { url, error } = await storageService.uploadServicePhoto(user.id, file);

      if (error) {
        console.error('Photo upload error:', error);
        toast.error(`Failed to upload photo: ${error.message}`);
        setSelectedPhoto(null);
        setIsUploadingPhoto(false);
        return;
      }

      setUploadedPhotoUrl(url);
      toast.success('Photo uploaded successfully!');
      console.log('Photo uploaded successfully:', url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
      setSelectedPhoto(null);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.serviceName || !formData.description) {
      toast.error(t('addService.required'));
      return;
    }

    // Check if photo is still uploading
    if (isUploadingPhoto) {
      toast.error('Please wait until the image is uploaded.');
      return;
    }

    // Validate that photo was uploaded
    if (!uploadedPhotoUrl) {
      toast.error('Please upload an image before adding a service.');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to add a service');
      navigate('/auth');
      return;
    }

    // Verify user session is still valid
    const { session } = await authService.getSession();
    if (!session) {
      toast.error('Session expired. Please log in again.');
      navigate('/auth');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting service creation for user:', user.id);
      console.log('User authenticated:', session.user.id);
      console.log('Using uploaded photo URL:', uploadedPhotoUrl);

      // Calculate trial dates (14 days from now)
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const serviceData = {
        user_id: user.id,
        service_name: formData.serviceName,
        description: formData.description,
        category: formData.category,
        address: formData.address || null,
        pricing: formData.price || null,
        social_links: formData.website ? { website: formData.website } : {},
        phone: formData.phone || null,
        email: formData.email || null,
        photos: [uploadedPhotoUrl], // Store as array with single photo
        status: 'trial',
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
        subscription_tier: formData.subscriptionTier,
        languages: ['en'],
        latitude: location?.lat || null,
        longitude: location?.lng || null,
      };

      console.log('Inserting service with data:', serviceData);

      // Insert service into database using service layer
      const { data: insertedData, error: insertError } = await dbService.createService(serviceData);

      if (insertError) {
        console.error('Service insert error:', insertError);
        throw new Error(insertError.message || 'Failed to insert service');
      }

      console.log('Service created successfully:', insertedData);
      const trialEndDate = trialEnd.toLocaleDateString();
      toast.success(`Service added! Trial ends on ${trialEndDate}`);
      navigate('/account');
    } catch (error) {
      console.error('Error adding service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to add service: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('addService.title')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Service Name */}
        <div className="space-y-2">
          <Label htmlFor="serviceName" className="text-sm font-medium">
            {t('addService.serviceName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="serviceName"
            name="serviceName"
            value={formData.serviceName}
            onChange={handleInputChange}
            placeholder={t('addService.serviceNamePlaceholder')}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {t('addService.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t('addService.descriptionPlaceholder')}
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-sm font-medium">
            {t('addService.category')} <span className="text-destructive">*</span>
          </Label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="repair">{t('addService.categories.repair')}</option>
            <option value="beauty">{t('addService.categories.beauty')}</option>
            <option value="construction">{t('addService.categories.construction')}</option>
            <option value="cleaning">{t('addService.categories.cleaning')}</option>
            <option value="delivery">{t('addService.categories.delivery')}</option>
            <option value="food">{t('addService.categories.food')}</option>
            <option value="transport">{t('addService.categories.transport')}</option>
            <option value="legal">{t('addService.categories.legal')}</option>
            <option value="accounting">{t('addService.categories.accounting')}</option>
            <option value="translation">{t('addService.categories.translation')}</option>
            <option value="education">{t('addService.categories.education')}</option>
            <option value="healthcare">{t('addService.categories.healthcare')}</option>
            <option value="housing">{t('addService.categories.housing')}</option>
            <option value="car_services">{t('addService.categories.car_services')}</option>
            <option value="other">{t('addService.categories.other')}</option>
          </select>
        </div>

        {/* Subscription Tier */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t('addService.subscriptionTier')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.tierDescription')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Standard Tier */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'standard' }))}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.subscriptionTier === 'standard'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg">{t('addService.standardTier')}</div>
                <div className="text-2xl font-bold text-primary my-2">£1.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">{t('addService.standardFeatures')}</div>
              </div>
            </button>

            {/* Top Tier */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'top' }))}
              className={`p-4 border-2 rounded-lg transition-all ${
                formData.subscriptionTier === 'top'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg">{t('addService.topTier')}</div>
                <div className="text-2xl font-bold text-primary my-2">£4.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">{t('addService.topFeatures')}</div>
              </div>
            </button>
          </div>
          <p className="text-xs text-muted-foreground italic">{t('addService.trialNote')}</p>
        </div>

        {/* Location Picker */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.location') || 'Service Location'}
          </Label>
          <LocationPicker 
            onLocationSelect={(lat, lng, address) => {
              setLocation({ lat, lng });
              if (address && !formData.address) {
                setFormData(prev => ({ ...prev, address }));
              }
            }}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            {t('addService.address')}
          </Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder={t('addService.addressPlaceholder')}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            {t('addService.price')}
          </Label>
          <Input
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder={t('addService.pricePlaceholder')}
          />
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.photos')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.photosDesc')}</p>
          
          {/* Show uploaded photo preview or upload button */}
          {uploadedPhotoUrl ? (
            <div className="space-y-2">
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary">
                <img 
                  src={uploadedPhotoUrl} 
                  alt="Service preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedPhotoUrl(null);
                  setSelectedPhoto(null);
                }}
                className="w-full"
              >
                Change Photo
              </Button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                id="photos"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="sr-only"
                disabled={isUploadingPhoto}
              />
              <label
                htmlFor="photos"
                className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors ${
                  isUploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isUploadingPhoto ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="text-sm text-muted-foreground">Uploading photo...</span>
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tap to upload photo (Required)</span>
                    <span className="text-xs text-muted-foreground">Photo will upload immediately</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Website / Social Media */}
        <div className="space-y-2">
          <Label htmlFor="website" className="text-sm font-medium">
            {t('addService.website')}
          </Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder={t('addService.websitePlaceholder')}
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            {t('addService.phone')}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder={t('addService.phonePlaceholder')}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            {t('addService.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('addService.emailPlaceholder')}
          />
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={isSubmitting || isUploadingPhoto || !uploadedPhotoUrl}
        >
          <Upload className="h-5 w-5 mr-2" />
          {isSubmitting ? 'Submitting...' : isUploadingPhoto ? 'Uploading photo...' : t('addService.submit')}
        </Button>
        {!uploadedPhotoUrl && !isUploadingPhoto && (
          <p className="text-xs text-center text-muted-foreground">
            Please upload a photo before submitting
          </p>
        )}
      </form>

      <BottomNav />
    </div>
  );
}
