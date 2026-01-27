import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ImagePlus, Lock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { authService, dbService, storageService } from '@/services';
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

export default function AddService() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: 'repair', // Default category
    address: '',
    city: 'london',
    borough: '',
    postcode: '',
    country: 'United Kingdom',
    price: '',
    website: '',
    phone: '',
    email: '',
    subscriptionTier: 'standard' as 'standard' | 'top', // Default to standard
  });
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['en']);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [premiumTrialUsed, setPremiumTrialUsed] = useState(false);

  // Fetch premium trial status on mount
  useEffect(() => {
    if (profile) {
      setPremiumTrialUsed(profile.premium_trial_used ?? false);
    }
  }, [profile]);

  // Standard is always free, premium has one-time trial
  const isPremiumTrialAvailable = !premiumTrialUsed;
  const canCreateService = formData.subscriptionTier === 'standard' || isPremiumTrialAvailable;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear postcode error when user types
    if (name === 'postcode') {
      setPostcodeError(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
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

    // Normalize the postcode
    const normalizedPostcode = postcodeValidation.normalized;

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

      // Check if premium tier and trial not available - redirect to payment
      if (formData.subscriptionTier === 'top' && !isPremiumTrialAvailable) {
        // Initiate premium payment flow via Stripe
        try {
          const { subscriptionService } = await import('@/services/subscriptionService');
          const { data, error } = await subscriptionService.createServiceSubscription(
            'pending-service', // Service will be created after payment
            'premium'
          );
          
          if (error) {
            toast.error(t('addService.paymentError'));
            return;
          }
          
          if (data?.url) {
            // Store service data temporarily for after payment
            localStorage.setItem('pendingServiceData', JSON.stringify({
              ...formData,
              uploadedPhotoUrl,
              selectedLanguages,
              location,
            }));
            window.open(data.url, '_blank');
            toast.info(t('addService.redirectingToPayment'));
          }
          return;
        } catch (error) {
          console.error('Payment initiation error:', error);
          toast.error(t('addService.paymentError'));
          return;
        }
      }

       // Check if premium tier and trial not available
      if (formData.subscriptionTier === 'top' && !isPremiumTrialAvailable) {
        // Redirect to subscription/payment flow
        toast.error(t('addService.premiumTrialUsed'));
        navigate('/my-services');
        return;
      }

      // Calculate trial dates for premium (14 days from now)
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      // Determine service status: standard is always 'active', premium starts as 'trial'
      const isStandard = formData.subscriptionTier === 'standard';
      const serviceStatus = isStandard ? 'active' : 'trial';

    // Geocode using the validated postcode (postcode is now required)
      let lat: number | null = null;
      let lng: number | null = null;
      
      const geocodeResult = await geocodePostcode(normalizedPostcode);
      if (geocodeResult) {
        lat = geocodeResult.latitude;
        lng = geocodeResult.longitude;
      }

      // Get display values for city 
      const cityLabel = getCityLabel(formData.city) || formData.city;
      
      const serviceData = {
        user_id: user.id,
        service_name: formData.serviceName,
        description: formData.description,
        category: formData.category,
        address: formData.address || null,
        city: cityLabel || null,
        borough: formData.borough || null,
        postcode: normalizedPostcode,
        country: 'United Kingdom',
        pricing: formData.price || null,
        social_links: formData.website ? { website: formData.website } : {},
        phone: formData.phone || null,
        email: formData.email || null,
        photos: [uploadedPhotoUrl], // Store as array with single photo
        status: serviceStatus,
        trial_start: isStandard ? null : trialStart.toISOString(),
        trial_end: isStandard ? null : trialEnd.toISOString(),
        subscription_tier: formData.subscriptionTier,
        languages: selectedLanguages.length > 0 ? selectedLanguages : ['en'],
        latitude: lat,
        longitude: lng,
      };

      console.log('Inserting service with data:', serviceData);

      // Insert service into database
      const { data: insertedData, error: insertError } = await dbService.createService(serviceData);

      if (insertError) {
        console.error('Service insert error:', insertError);
        throw new Error(insertError.message || 'Failed to insert service');
      }

      // Mark premium trial as used (only for premium tier)
      if (!isStandard) {
        await dbService.markPremiumTrialUsed(user.id);
      }

      console.log('Service created successfully:', insertedData);
      
      if (isStandard) {
        toast.success(t('addService.standardServiceAdded'));
      } else {
        const trialEndDate = trialEnd.toLocaleDateString();
        toast.success(t('addService.serviceAdded').replace('{date}', trialEndDate));
      }

      navigate('/account');
      } catch (error) {
        console.error('Error adding service:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`${t('addService.failed')}: ${errorMessage}`);
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
            <option value="repair">{t("categories.repair")}</option>
            <option value="beauty">{t("categories.beauty")}</option>
            <option value="construction">{t("categories.construction")}</option>
            <option value="cleaning">{t("categories.cleaning")}</option>
            <option value="delivery">{t("categories.delivery")}</option>
            <option value="food">{t("categories.food")}</option>
            <option value="transport">{t("categories.transport")}</option>
            <option value="legal">{t("categories.legal")}</option>
            <option value="accounting">{t("categories.accounting")}</option>
            <option value="translation">{t("categories.translation")}</option>
            <option value="education">{t("categories.education")}</option>
            <option value="healthcare">{t("categories.healthcare")}</option>
            <option value="housing">{t("categories.housing")}</option>
            <option value="car_services">{t("categories.car_services")}</option>
            <option value="other">{t("categories.other")}</option>
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

        {/* Subscription Tier */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t('addService.subscriptionTier')} <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">{t('addService.tierDescriptionNew')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Standard Tier - Always Free */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'standard' }))}
              className={`p-4 border-2 rounded-lg transition-all relative ${
                formData.subscriptionTier === 'standard'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg flex items-center gap-2">
                  {t('addService.standardTier')}
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{t('addService.free')}</span>
                </div>
                <div className="text-2xl font-bold text-green-600 my-2">{t('addService.freeForever')}</div>
                <div className="text-sm text-muted-foreground">{t('addService.standardFeatures')}</div>
              </div>
            </button>

            {/* Top/Premium Tier */}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: 'top' }))}
              className={`p-4 border-2 rounded-lg transition-all relative ${
                formData.subscriptionTier === 'top'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-left">
                <div className="font-semibold text-lg flex items-center gap-2">
                  {t('addService.topTier')}
                  {premiumTrialUsed ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t('addService.paidBadge')}</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{t('addService.trialBadge')}</span>
                  )}
                </div>
                <div className="text-2xl font-bold text-primary my-2">£4.99<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                <div className="text-sm text-muted-foreground">{t('addService.topFeatures')}</div>
                {!premiumTrialUsed && (
                  <div className="text-xs text-amber-600 mt-2">{t('addService.premiumTrialNote')}</div>
                )}
                {premiumTrialUsed && (
                  <div className="text-xs text-primary mt-2">{t('addService.premiumPaymentRequired')}</div>
                )}
              </div>
            </button>
          </div>
          {formData.subscriptionTier === 'standard' && (
            <p className="text-xs text-green-600 italic">{t('addService.standardFreeNote')}</p>
          )}
          {formData.subscriptionTier === 'top' && !premiumTrialUsed && (
            <p className="text-xs text-amber-600 italic">{t('addService.premiumTrialInfo')}</p>
          )}
          {formData.subscriptionTier === 'top' && premiumTrialUsed && (
            <p className="text-xs text-primary italic">{t('addService.premiumPaymentInfo')}</p>
          )}
        </div>

        {/* Location Fields */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <Label className="text-sm font-medium"> 
            {t('addService.locationSection')} <span className="text-destructive">*</span>
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
              {t('addService.postcode')} <span className="text-destructive">*</span>
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
            <p className="text-xs text-muted-foreground">{t('addService.addressHint')}</p>
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
