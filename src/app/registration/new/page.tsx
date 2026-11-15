
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerStudent } from '@/app/actions/register-student';

const AddressSchema = z.object({
  line1: z.string().min(1, 'Address Line 1 is required'),
  line2: z.string().optional(),
  line3: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  country: z.string().min(1, 'Country is required'),
});

const FormSchema = z.object({
  student_name: z.string().min(1, 'Student name is required'),
  course: z.string().min(1, 'Course is required'),
  university: z.string().min(1, 'University is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  category: z.string().min(1, 'Category is required'),
  mobile_number: z.string().min(1, 'Mobile number is required'),
  correspondence_address: AddressSchema,
  permanent_address: AddressSchema,
  profile_url: z.string().optional(),
  hall_ticket_url: z.string().optional(),
  enrolment_number: z.string().min(1, 'Enrolment number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const renderError = (error: string | undefined) => {
  return error && <p className="text-sm text-red-600 pt-1">{error}</p>;
};

export default function NewRegistrationPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsCorrespondence, setSameAsCorrespondence] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      student_name: '',
      course: '',
      university: '',
      email: '',
      phone: '',
      date_of_birth: '',
      category: 'General',
      mobile_number: '',
      correspondence_address: {
        line1: '',
        line2: '',
        line3: '',
        district: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      permanent_address: {
        line1: '',
        line2: '',
        line3: '',
        district: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      enrolment_number: '',
      password: '',
      profile_url: '',
      hall_ticket_url: '',
    },
  });

  const correspondenceAddress = form.watch('correspondence_address');

  const handleSameAsCorrespondenceChange = (checked: boolean) => {
    setSameAsCorrespondence(checked);
    if (checked) {
      form.setValue('permanent_address', correspondenceAddress);
    } else {
      form.setValue('permanent_address', {
        line1: '',
        line2: '',
        line3: '',
        district: '',
        state: '',
        pincode: '',
        country: 'India',
      });
    }
  };

  async function onSubmit(data: FormSchemaType) {
    setIsSubmitting(true);

    const formData = new FormData();

    // Append all simple fields
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && key !== 'profile_url' && key !== 'hall_ticket_url') {
        formData.append(key, value);
      }
    });

    // Append empty URLs (file uploads removed)
    formData.append('profile_url', '');
    formData.append('hall_ticket_url', '');

    // Append stringified address objects
    formData.append(
      'correspondence_address',
      JSON.stringify(data.correspondence_address)
    );
    formData.append(
      'permanent_address',
      JSON.stringify(data.permanent_address)
    );

    const result = await registerStudent(formData);

    if (result.success) {
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created. Redirecting to login...',
      });
      if (data.university === 'PONDI') {
        router.push('/pudde/login');
      } else {
        router.push(`/login`);
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: result.message,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-none">
        <CardHeader>
          <CardTitle className="text-2xl">New Student Registration</CardTitle>
          <CardDescription>
            Fill out the form below to create your student account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Details */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="student_name">Full Name</Label>
                  <Input
                    id="student_name"
                    {...form.register('student_name')}
                  />
                  {renderError(form.formState.errors.student_name?.message)}
                </div>
                 <div>
                  <Label htmlFor="university">University</Label>
                  <Select
                    onValueChange={(value) => form.setValue('university', value)}
                    defaultValue={form.getValues('university')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IGNOU">IGNOU</SelectItem>
                      <SelectItem value="PONDI">PONDI</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError(form.formState.errors.university?.message)}
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" {...form.register('course')} />
                  {renderError(form.formState.errors.course?.message)}
                </div>
                <div>
                  <Label htmlFor="enrolment_number">Enrolment Number</Label>
                  <Input
                    id="enrolment_number"
                    {...form.register('enrolment_number')}
                  />
                  {renderError(
                    form.formState.errors.enrolment_number?.message
                  )}
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    {...form.register('password')}
                  />
                  {renderError(form.formState.errors.password?.message)}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...form.register('email')} />
                  {renderError(form.formState.errors.email?.message)}
                </div>
                <div>
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                    id="mobile_number"
                    {...form.register('mobile_number')}
                  />
                  {renderError(form.formState.errors.mobile_number?.message)}
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    {...form.register('date_of_birth')}
                  />
                  {renderError(form.formState.errors.date_of_birth?.message)}
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => form.setValue('category', value)}
                    defaultValue={form.getValues('category')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="OBC">OBC</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="ST">ST</SelectItem>
                      <SelectItem value="EWS">EWS</SelectItem>
                    </SelectContent>
                  </Select>
                  {renderError(form.formState.errors.category?.message)}
                </div>
                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input id="phone" {...form.register('phone')} />
                </div>
              </div>
            </section>

            {/* Correspondence Address */}
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                Correspondence Address
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="correspondence_address.line1">
                      Address Line 1
                    </Label>
                    <Input
                      id="correspondence_address.line1"
                      {...form.register('correspondence_address.line1')}
                    />
                    {renderError(
                      form.formState.errors.correspondence_address?.line1
                        ?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="correspondence_address.line2">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="correspondence_address.line2"
                      {...form.register('correspondence_address.line2')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="correspondence_address.district">
                      District
                    </Label>
                    <Input
                      id="correspondence_address.district"
                      {...form.register('correspondence_address.district')}
                    />
                    {renderError(
                      form.formState.errors.correspondence_address?.district
                        ?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="correspondence_address.state">State</Label>
                    <Input
                      id="correspondence_address.state"
                      {...form.register('correspondence_address.state')}
                    />
                    {renderError(
                      form.formState.errors.correspondence_address?.state
                        ?.message
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="correspondence_address.pincode">
                      Pincode
                    </Label>
                    <Input
                      id="correspondence_address.pincode"
                      {...form.register('correspondence_address.pincode')}
                    />
                    {renderError(
                      form.formState.errors.correspondence_address?.pincode
                        ?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="correspondence_address.country">
                      Country
                    </Label>
                    <Input
                      id="correspondence_address.country"
                      {...form.register('correspondence_address.country')}
                    />
                    {renderError(
                      form.formState.errors.correspondence_address?.country
                        ?.message
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Permanent Address */}
            <section>
              <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h3 className="text-lg font-semibold">Permanent Address</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAs"
                    checked={sameAsCorrespondence}
                    onChange={(e) =>
                      handleSameAsCorrespondenceChange(e.target.checked)
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="sameAs" className="text-sm">
                    Same as Correspondence
                  </Label>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="permanent_address.line1">
                      Address Line 1
                    </Label>
                    <Input
                      id="permanent_address.line1"
                      {...form.register('permanent_address.line1')}
                      disabled={sameAsCorrespondence}
                    />
                    {renderError(
                      form.formState.errors.permanent_address?.line1?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanent_address.line2">
                      Address Line 2 (Optional)
                    </Label>
                    <Input
                      id="permanent_address.line2"
                      {...form.register('permanent_address.line2')}
                      disabled={sameAsCorrespondence}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="permanent_address.district">District</Label>
                    <Input
                      id="permanent_address.district"
                      {...form.register('permanent_address.district')}
                      disabled={sameAsCorrespondence}
                    />
                    {renderError(
                      form.formState.errors.permanent_address?.district?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanent_address.state">State</Label>
                    <Input
                      id="permanent_address.state"
                      {...form.register('permanent_address.state')}
                      disabled={sameAsCorrespondence}
                    />
                    {renderError(
                      form.formState.errors.permanent_address?.state?.message
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="permanent_address.pincode">Pincode</Label>
                    <Input
                      id="permanent_address.pincode"
                      {...form.register('permanent_address.pincode')}
                      disabled={sameAsCorrespondence}
                    />
                    {renderError(
                      form.formState.errors.permanent_address?.pincode?.message
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanent_address.country">Country</Label>
                    <Input
                      id="permanent_address.country"
                      {...form.register('permanent_address.country')}
                      disabled={sameAsCorrespondence}
                    />
                    {renderError(
                      form.formState.errors.permanent_address?.country?.message
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end items-center gap-4 pt-4 border-t">
              <Button variant="outline" asChild>
                <Link href="/login">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
