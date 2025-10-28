class CommandResults():
    def __init__(self, data: dict={}, errors: str=None, success: bool=True):
        self._data = data
        self._errors = errors
        self._success = success

    def __str__(self):
        return f"CommandResults(success={self.success}, data={self.data}, errors={self.errors})"
    
    @property
    def data(self) -> dict:
        return self._data
    
    @property
    def errors(self) -> str:
        return self._errors
    
    @property
    def success(self) -> bool:
        return self._success