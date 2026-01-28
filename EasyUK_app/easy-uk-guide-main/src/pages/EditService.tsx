import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService, dbService, storageService, subscriptionService } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { toast } from 'sonner';
import { LanguageMultiSelect } from '@/components/LanguageMultiSelect';
import { geocodePostcode } from '@/lib/geocoding';
import { validateUKPostcode, UK_CITIES, LONDON_BOROUGHS, getCityLabel, getBoroughLabel } from '@/lib/ukLocation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    city: 'london',
    borough: '',
    postcode: '',
    country: 'United Kingdom',
    price: '',
    website: '',
    phone: '',
    email: '',
  });

  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Plan upgrade state (from Lovable)
  const [currentTier, setCurrentTier] = useState<'standard' | 'top'>('standard');
  const [selectedTier, setSelectedTier] = useState<'standard' | 'top'>('standard');
  const [isUpgrading, setIsUpgrading] = useState(false);

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
        const existingCity = (data as any).city || '';
        const existingBorough = (data as any).borough || '';
        // Try to match existing city to our dropdown values
        const cityValue = existingCity.toLowerCase().includes('london') ? 'london' : 'london';

        setFormData({
          serviceName: data.service_name || '',
          description: data.description || '',
          category: data.category || 'repair',
          address: data.address || '',
          city: cityValue,
          borough: existingBorough || '',
          postcode: (data as any).postcode || '',
          country: 'United Kingdom',
          price: data.pricing || '',
          website: socialLinks?.website || '',
          phone: data.phone || '',
          email: data.email || '',
        });

        setSelectedLanguages(data.languages || ['en']);

        if (data.photos && data.photos.length > 0) {
          setExistingPhotoUrl(data.photos[0]);
        }

        // IMPORTANT: plan state
        const tier = (data as any).subscription_tier === 'top' ? 'top' : 'standard';
        setCurrentTier(tier);
        setSelectedTier(tier);
      }
    } catch (error) {
      console.error('Error fetching service:', error);
      toast.error('Failed to load service');
      navigate('/my-services');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'postcode') {
      setPostcodeError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    const { session } = await authService.getSession();
    if (!session) {
      toast.error('Session expired. Please log in again.');
      navigate('/auth');
      return;
    }

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

    // Validate postcode (required and must be valid UK format)
    if (!formData.postcode.trim()) {
      setPostcodeError(t('validation.postcodeRequired'));
      toast.error(t('validation.postcodeRequired'));
      return;
    }

    const postcodeValidation = validateUKPostcode(formData.postcode);
    if (!postcodeValidation.isValid) {
      setPostcodeError(t('validation.postcodeInvalid'));
      toast.error(t('validation.postcodeInvalid'));
      return;
    }

    const normalizedPostcode = postcodeValidation.normalized;

    if (isUploadingPhoto) {
      toast.error('Please wait until the image is uploaded.');
      return;
    }

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

    const { session } = await authService.getSession();
    if (!session) {
      toast.error('Session expired. Please log in again.');
      navigate('/auth');
      return;
    }

    // Upgrade gating: Standard -> Top requires payment first (NO BYPASS)
    const isUpgradingPlan = currentTier === 'standard' && selectedTier === 'top';
    if (isUpgradingPlan) {
      setIsUpgrading(true);
      try {
        localStorage.setItem(
          'pendingServiceUpgrade',
          JSON.stringify({
            serviceId: id,
            formData,
            selectedLanguages,
            finalPhotoUrl,
          })
        );

        // Initiate payment flow (RevenueCat / subscription flow)
        const { data, error } = await subscriptionService.createServiceSubscription(id, 'top');

        if (error) {
          toast.error(t('editService.upgradeError'));
          return;
        }

        if (data?.url) {
          window.open(data.url, '_blank');
          toast.info(t('editService.redirectingToPayment'));
        } else {
          toast.error(t('editService.upgradeError'));
        }

        return; // IMPORTANT: do not update service before payment
      } catch (error) {
        console.error('Payment initiation error:', error);
        toast.error(t('editService.upgradeError'));
        return;
      } finally {
        setIsUpgrading(false);
      }
    }

    setIsSubmitting(true);

    try {
      // Geocode
      let lat: number | null = null;
      let lng: number | null = null;

      const geocodeResult = await geocodePostcode(normalizedPostcode);
      if (geocodeResult) {
        lat = geocodeResult.latitude;
        lng = geocodeResult.longitude;
      }

      // Get display value for city
      const cityLabel = getCityLabel(formData.city) || formData.city;

      // Normal update (no plan change here)
      const { error: updateError } = await dbService.updateService(id, {
        service_name: formData.serviceName,
        description: formData.description,
        category: formData.category,
        address: formData.address || null,
        city: cityLabel || null,
        borough: formData.borough || null,
        postcode: normalizedPostcode,
        country: 'United Kingdom',
        latitude: lat,
        longitude: lng,
        pricing: formData.price || null,
        social_links: formData.website ? { website: formData.website } : {},
        phone: formData.phone || null,
        email: formData.email || null,
        photos: [finalPhotoUrl],
        languages: selectedLanguages.length > 0 ? selectedLanguages : ['en'],
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">{t('editService.title')}</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-6 space-y-4">
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
            {/* Keep YOUR translation keys */}
            <option value="repair">{t('categories.repair')}</option>
            <option value="beauty">{t('categories.beauty')}</option>
            <option value="construction">{t('categories.construction')}</option>
            <option value="cleaning">{t('categories.cleaning')}</option>
            <option value="delivery">{t('categories.delivery')}</option>
            <option value="food">{t('categories.food')}</option>
            <option value="transport">{t('categories.transport')}</option>
            <option value="legal">{t('categories.legal')}</option>
            <option value="accounting">{t('categories.accounting')}</option>
            <option value="translation">{t('categories.translation')}</option>
            <option value="education">{t('categories.education')}</option>
            <option value="healthcare">{t('categories.healthcare')}</option>
            <option value="housing">{t('categories.housing')}</option>
            <option value="car_services">{t('categories.car_services')}</option>
            <option value="other">{t('categories.other')}</option>
          </select>
        </div>

        {/* Available Languages */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.availableLanguages')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.availableLanguagesDesc')}</p>
          <LanguageMultiSelect
            selectedLanguages={selectedLanguages}
            onChange={setSelectedLanguages}
            placeholder={t('languages.selectLanguages')}
          />
        </div>

        {/* Subscription Plan Upgrade (added from Lovable) */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('editService.currentPlan')}</Label>

          <div className="grid grid-cols-1 md:grid-rows-2 gap-3">
            {/* Standard */}
            <button
              type="button"
              onClick={() => {
                // no downgrade
                if (currentTier === 'standard') setSelectedTier('standard');
              }}
              disabled={currentTier === 'top'}
              className={`p-4 border-2 rounded-lg transition-all relative ${
                selectedTier === 'standard'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              } ${currentTier === 'top' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg flex items-center gap-2">
                  {t('addService.standardTier')}
                  {currentTier === 'standard' && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      {t('editService.currentPlanBadge')}
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-primary my-2">
                  {t('addService.freeForever')}
                </div>
                <div className="text-sm text-muted-foreground">{t('addService.standardFeatures')}</div>
              </div>
            </button>

            {/* Top */}
            <button
              type="button"
              onClick={() => setSelectedTier('top')}
              className={`p-4 border-2 rounded-lg transition-all relative ${
                selectedTier === 'top'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg flex items-center gap-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  {t('addService.topTier')}
                  {currentTier === 'top' && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {t('editService.currentPlanBadge')}
                    </span>
                  )}
                </div>
                <div className="text-lg font-bold text-primary my-2">
                  £4.99
                  <span className="text-xs font-normal text-muted-foreground">/month</span>
                </div>
                <div className="text-sm text-muted-foreground">{t('addService.topFeatures')}</div>
                {currentTier === 'standard' && selectedTier === 'top' && (
                  <div className="text-xs text-primary mt-2 font-medium">
                    {t('editService.upgradeNote')}
                  </div>
                )}
              </div>
            </button>
          </div>

          {currentTier === 'top' && (
            <p className="text-xs text-muted-foreground italic">{t('editService.alreadyPremium')}</p>
          )}
          {currentTier === 'standard' && selectedTier === 'top' && (
            <p className="text-xs text-primary italic">{t('editService.upgradeInfo')}</p>
          )}
        </div>

        {/* Location Fields */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label className="text-sm font-medium">{t('addService.locationSection')}
            <span className="text-destructive">*</span>
          </Label>

           <p className="text-sm text-muted-foreground">{t('addService.locationDescription')}</p>
          
          {/* Country (fixed) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              {t('addService.country')}
            </Label>
            <div className="px-3 py-2 border border-border rounded-lg bg-muted/50 text-muted-foreground">
              🇬🇧 United Kingdom
            </div>
          </div>
          
          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium">
              {t('addService.city')} <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.city} onValueChange={(value) => handleSelectChange('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('addService.selectCity')} />
              </SelectTrigger>
              <SelectContent className="bg-background">
                {UK_CITIES.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Borough (only for London) */}
          {formData.city === 'london' && (
            <div className="space-y-2">
              <Label htmlFor="borough" className="text-sm font-medium">
                {t('addService.borough')}
                <span className="text-muted-foreground text-xs ml-1">({t('addService.recommended')})</span>
              </Label>
              <Select 
                value={formData.borough || 'none'} 
                onValueChange={(value) => handleSelectChange('borough', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('addService.selectBorough')} />
                </SelectTrigger>
                <SelectContent className="bg-background max-h-[300px]">
                  <SelectItem value="none">{t('addService.noBorough')}</SelectItem>
                  {LONDON_BOROUGHS.map((borough) => (
                    <SelectItem key={borough.value} value={borough.value}>
                      {borough.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Postcode */}
          <div className="space-y-2">
            <Label htmlFor="postcode" className="text-sm font-medium">
              {t('addService.postcode')}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postcode"
              name="postcode"
              value={formData.postcode}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData(prev => ({ ...prev, postcode: value }));
                setPostcodeError(null);
              }}
              placeholder={t('addService.postcodePlaceholder')}
              className={postcodeError ? 'border-destructive' : ''}
            />
            {postcodeError && (
              <p className="text-sm text-destructive">{postcodeError}</p>
            )}
            <p className="text-xs text-muted-foreground">{t('addService.postcodeHint')}</p>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium">
              {t('addService.address')}
              <span className="text-muted-foreground text-xs ml-1">({t('common.optional')})</span>
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t('addService.addressPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('addService.postcodeHint')}</p>
          </div>
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

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {t('addService.photos')} <span className="text-destructive">*</span>
          </Label>

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

        {/* Website */}
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

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || isUploadingPhoto || isUpgrading}
        >
          {currentTier === 'standard' && selectedTier === 'top' ? (
            <>
              <Crown className="h-5 w-5 mr-2" />
              {isUpgrading ? t('editService.processing') : t('editService.upgradeAndSave')}
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              {isSubmitting
                ? t('editService.saving')
                : isUploadingPhoto
                ? 'Uploading photo...'
                : t('editService.save')}
            </>
          )}
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

