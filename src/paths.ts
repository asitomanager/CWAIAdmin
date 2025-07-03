const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";

export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    //overview: '/dashboard',
    admindashboard: '/dashboard/admindashboard',
    account: '/dashboard/account',
    customers: '/dashboard/customers',
    candidates: '/dashboard/candidates',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
    bulkprofileupload: '/dashboard/bulkprofileupload',
    questionbankupload: '/dashboard/questionbankupload',
    jdupload: '/dashboard/jdupload',
    resumeupload: '/dashboard/resumeupload',
    candidatedashboard : '/dashboard/candidatedashboard',
    createskillanddesignation : '/dashboard/createskilldesignation',
    createadminuser : '/dashboard/createadmin',
    changepassword : '/dashboard/changepassword',
  },
  errors: { notFound: '/errors/not-found' },
  
  urls:{
    //sign 
    signin: isLocal
    ? "http://localhost:8000/login"
    : `${process.env.NEXT_PUBLIC_BASE_URL}/login`,

    logout: isLocal
    ? "http://localhost:8000/logout"
    : `${process.env.NEXT_PUBLIC_BASE_URL}/logout`,

    refreshtoken: isLocal ?'http://localhost:8000/refresh'
    : `${process.env.NEXT_PUBLIC_BASE_URL}/refresh`,
   
    //dashboard
    dashboard: isLocal ?'http://localhost:8000/reporting/dashboard'
    : `${process.env.NEXT_PUBLIC_BASE_URL}/reporting/dashboard`,
    
    //bulk upload
    bulkprofile: isLocal ? 'http://localhost:8000/assets/bulk_profile'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/assets/bulk_profile`,
    
    //candidates
    candidate: isLocal ? 'http://localhost:8000/candidates'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/candidates`,
    
    //resume
    resume: isLocal ? 'http://localhost:8000/assets/resume'
    : `${process.env.NEXT_PUBLIC_BASE_URL}/assets/resume`,
    
    //lov
    lov: isLocal ? 'http://localhost:8000/lov'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/lov`,
    
    //jd upload
    jdupload: isLocal ? 'http://localhost:8000/assets/jd'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/assets/jd`,
    
    //question bank upload 
    qaupload: isLocal ? 'http://localhost:8000/assets/question_bank'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/assets/question_bank`,
    
    //candidate search in candidate details page
    candidatesearch: isLocal ? 'http://localhost:8000/search'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/search`,
    
    //transcript download candidate details page
    transcriptDownload: isLocal ? 'http://localhost:8000/assets/documents'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/assets/documents`,
    
    //candidate search in candidate details page
    anasysReportDownload: isLocal ? 'http://localhost:8000/assets/analysis-report'
    : `${process.env.NEXT_PUBLIC_BASE_URL}/assets/analysis-report`,
    
    //schedule interview button 
    scheduleInterview: isLocal ? 'http://localhost:8000/interview/schedule'
    : `${process.env.NEXT_PUBLIC_BASE_URL}/interview/schedule`,

    //download candidate excel
    downloadCandidate: isLocal ? 'http://localhost:8000/candidates/export'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/candidates/export`,

    //change password
    changePassword: isLocal ? 'http://localhost:8000/change-password'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/change-password`,

    //bulk upload
    bulkResumeUpload: isLocal ? 'http://localhost:8000/assets/bulk_resume'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/assets/bulk_resume`,

    //bulk upload
    timelineGraph: isLocal ? 'http://localhost:8000/reporting/timeline'
    :`${process.env.NEXT_PUBLIC_BASE_URL}/reporting/timeline`,
  },
} as const;
