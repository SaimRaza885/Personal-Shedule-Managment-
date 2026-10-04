import { Component } from "react";
import { ErrorState } from "./ErrorState";

/**
 * Catches render errors from any screen below the shell so one crashed
 * page does not take down the whole application.
 */
export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[AppErrorBoundary] screen crashed:", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <ErrorState
            title="This screen crashed"
            description={this.state.error?.message}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }
    return this.props.children;
  }
}
