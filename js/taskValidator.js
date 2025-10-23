class TaskValidator {
    validateTaskText(text) {
        if (typeof text !== 'string') {
            throw new Error('Task text must be a string');
        }

        const trimmed = text.trim();
        
        if (trimmed.length === 0) {
            throw new Error('Task text cannot be empty');
        }

        if (trimmed.length > 100) {
            throw new Error('Task text exceeds maximum length (100 characters)');
        }

        return true;
    }
}