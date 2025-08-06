import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Alert variant="destructive">
                    <AlertTitle>Something went wrong</AlertTitle>
                    <AlertDescription>
                        Please try refreshing the page or contact support if the problem persists.
                    </AlertDescription>
                </Alert>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;