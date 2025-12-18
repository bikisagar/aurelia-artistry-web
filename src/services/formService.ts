import content from '../data/content.json';

interface FormData {
  name: string;
  email: string;
  message: string;
  reason: string;
}

export const submitToGoogleForm = async (data: FormData): Promise<boolean> => {
  try {
    const FORM_SUBMISSION_URL = content.contact.form.submissionUrl;
    
    // Validate data
    if (!data.name || !data.email || !data.message || !data.reason) {
      console.error('Missing required form fields');
      return false;
    }

    if (!FORM_SUBMISSION_URL) {
      console.error('Form submission URL not configured');
      return false;
    }

    // Convert to URL-encoded format (what Google Forms expects)
    const params = new URLSearchParams();
    params.append("Full Name", data.name.trim());
    params.append("Email Address", data.email.trim());
    params.append("Reason for Contact", data.reason.trim());
    params.append("Message", data.message.trim());

    console.log('Sending form data to:', FORM_SUBMISSION_URL);
    console.log('Form fields:', {
      name: data.name,
      email: data.email,
      reason: data.reason,
      message: data.message
    });

    const response = await fetch(FORM_SUBMISSION_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    console.log('Form submitted successfully');
    return true;
  } catch (error) {
    console.error('Form submission error:', error);
    return false;
  }
};

// Optional: Helper function to validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Optional: Helper function to validate form data before submission
export const validateFormData = (data: FormData): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Full name is required');
  }

  if (!data.email || data.email.trim().length === 0) {
    errors.push('Email address is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Please enter a valid email address');
  }

  if (!data.reason || data.reason.trim().length === 0) {
    errors.push('Reason for contact is required');
  }

  if (!data.message || data.message.trim().length === 0) {
    errors.push('Message is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};