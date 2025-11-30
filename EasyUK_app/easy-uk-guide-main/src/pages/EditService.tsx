import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService, dbService, storageService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';

export default function EditService() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'repair',
    address: '',
    price: '',
    website: '',
    phone: '',
    email: '',
  });
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchService();
    }
  }, [user, id]);

  const fetchService = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await dbService.getService(id);

      if (error) throw error;

      if (data && data.user_id === user.id) {
        const socialLinks = data.social_links as { website?: string } | null;
        setFormData({
          serviceName: data.service_name || '',
          description: data.description || '',
          category: data.category || 'repair',
          address: data.address || '',
          price: data.pricing || '',
          website: socialLinks?.website || '',
          phone: data.phone || '',
          email: data.email || '',
        });
        if (data.photos && data.photos.length > 0) {
          setExistingPhotoUrl(data.photos[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service');
      navigate('/my-services');
    } finally {
      setLoading(false);
    }
  };

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
      console.log('New photo uploaded successfully:', url);
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

    // Validate that service has a photo (either existing or newly uploaded)
    const finalPhotoUrl = uploadedPhotoUrl || existingPhotoUrl;
    if (!finalPhotoUrl) {
      toast.error('Please upload an image before saving the service.');
      return;
    }

    if (!user || !id) {
      toast.error('You must be logged in to edit a service');
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
      console.log('Updating service with photo:', finalPhotoUrl);
      console.log('User authenticated:', session.user.id);

      // Update service in database
      const { error: updateError } = await dbService.updateService(id, {
        service_name: formData.serviceName,
        description: formData.description,
        category: formData.category,
        address: formData.address || null,
        pricing: formData.price || null,
        social_links: formData.website ? { website: formData.website } : {},
        phone: formData.phone || null,
        email: formData.email || null,
        photos: [finalPhotoUrl],
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        throw updateError;
      }

      toast.success(t('editService.updated'));
      navigate('/my-services');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(t('editService.failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <h1 className="text-xl font-semibold">{t('editService.title')}</h1>
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

        {/* Photo Upload Section */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.photos')} <span className="text-destructive">*</span>
          </Label>
          
          {/* Show current or new photo */}
          {(uploadedPhotoUrl || existingPhotoUrl) ? (
            <div className="space-y-2">
              <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-primary">
                <img 
                  src={uploadedPhotoUrl || existingPhotoUrl || ''} 
                  alt="Service preview" 
                  className="w-full h-full object-cover"
                />
                {uploadedPhotoUrl && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                    New Photo
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedPhotoUrl(null);
                  setExistingPhotoUrl(null);
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
                    <span className="text-sm text-muted-foreground">Tap to upload new photo (Required)</span>
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
          disabled={isSubmitting || isUploadingPhoto}
        >
          <Save className="h-5 w-5 mr-2" />
          {isSubmitting ? t('editService.saving') : isUploadingPhoto ? 'Uploading photo...' : t('editService.save')}
        </Button>
        {!existingPhotoUrl && !uploadedPhotoUrl && !isUploadingPhoto && (
          <p className="text-xs text-center text-muted-foreground">
            Please upload a photo before saving
          </p>
        )}
      </form>

      <BottomNav />
    </div>
  );
}

