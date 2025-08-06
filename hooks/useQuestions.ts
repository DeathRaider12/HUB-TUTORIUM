// Add caching and pagination
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useQuestions(pageSize = 10) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const fetchQuestions = async (startAfterDoc?: any) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'questions'),
                orderBy('createdAt', 'desc'),
                limit(pageSize),
                ...(startAfterDoc ? [startAfter(startAfterDoc)] : [])
            );

            const snap = await getDocs(q);
            const newQuestions = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setLastDoc(snap.docs[snap.docs.length - 1]);
            setHasMore(!snap.empty && snap.docs.length === pageSize);

            return newQuestions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        } finally {
            setLoading(false);
        }
    };

    return { questions, loading, hasMore, fetchQuestions };
}