class CommandResults():
    """Result container for command execution.
    
    Stores the result of command execution, including data, error messages,
    and success status.
    """
    def __init__(self, data: dict={}, errors: str=None, success: bool=True):
        """Initialize command results.
        
        Args:
            data: Dictionary containing the result data. Defaults to empty dict.
            errors: Error message string if execution failed. Defaults to None.
            success: Boolean indicating whether execution was successful.
                Defaults to True.
        """
        self._data = data
        self._errors = errors
        self._success = success

    def __str__(self):
        """Return a string representation of the command results.
        
        Returns:
            String representation showing success status, data, and errors.
        """
        return f"CommandResults(success={self.success}, data={self.data}, errors={self.errors})"
    
    @property
    def data(self) -> dict:
        """Get the result data.
        
        Returns:
            Dictionary containing the result data.
        """
        return self._data
    
    @property
    def errors(self) -> str:
        """Get the error message.
        
        Returns:
            Error message string if execution failed, None otherwise.
        """
        return self._errors
    
    @property
    def success(self) -> bool:
        """Get the success status.
        
        Returns:
            True if execution was successful, False otherwise.
        """
        return self._success