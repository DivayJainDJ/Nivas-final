import { buildFirebaseUser } from '../store/authSessionStore.js'

let confirmationResult = null
let recaptchaVerifier = null

async function loadFirebaseAuth() {
  const [{ auth }, firebaseAuth] = await Promise.all([
    import('../config/firebase'),
    import('firebase/auth'),
  ])
  return { auth, firebaseAuth }
}

export async function loginWithEmail({ email, password, role }) {
  const { auth, firebaseAuth } = await loadFirebaseAuth()
  await firebaseAuth.setPersistence(auth, firebaseAuth.browserLocalPersistence)
  const result = await firebaseAuth.signInWithEmailAndPassword(auth, email, password)
  return buildFirebaseUser(result.user, role)
}

export async function logoutFirebaseSession() {
  try {
    const { auth, firebaseAuth } = await loadFirebaseAuth()
    await firebaseAuth.signOut(auth)
  } catch {
    // Demo continuity should not fail logout.
  }
}

export async function sendPhoneOtp({ phone, containerId = 'nivasai-recaptcha' }) {
  const { auth, firebaseAuth } = await loadFirebaseAuth()
  const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`

  if (!recaptchaVerifier) {
    recaptchaVerifier = new firebaseAuth.RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    })
  }

  confirmationResult = await firebaseAuth.signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
  return formattedPhone
}

export async function verifyPhoneOtp({ otp, role }) {
  if (!confirmationResult) {
    throw new Error('OTP session expired. Please request a new code.')
  }

  const result = await confirmationResult.confirm(otp)
  confirmationResult = null
  return buildFirebaseUser(result.user, role)
}
