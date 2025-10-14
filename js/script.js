// سيحتوي هذا الملف على كود React الكامل الذي قدمته
// بما في ذلك جميع المكونات والوظائف

// سيتم وضع كود React الكامل هنا كما هو...
// (الكود الذي قدمته بالكامل)

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, collection, query, where, getDocs, setDoc, onSnapshot, runTransaction, addDoc, serverTimestamp, orderBy, limit, deleteDoc } from 'firebase/firestore';

// ... (الكود الكامل كما هو)

// كل المكونات ستبقى كما هي

export default function App() {
    // ... (الكود الرئيسي)
}