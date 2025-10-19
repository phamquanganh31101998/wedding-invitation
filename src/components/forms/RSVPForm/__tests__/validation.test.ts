import { validationSchema } from '../validation';

describe('RSVPForm Validation Schema', () => {
  describe('name validation', () => {
    it('should require name', async () => {
      const result = await validationSchema
        .validateAt('name', { name: '' })
        .catch((err) => err);
      expect(result.message).toBe('Name is required');
    });

    it('should require minimum 2 characters', async () => {
      const result = await validationSchema
        .validateAt('name', { name: 'A' })
        .catch((err) => err);
      expect(result.message).toBe('Name must be at least 2 characters long');
    });

    it('should limit to 50 characters', async () => {
      const longName = 'A'.repeat(51);
      const result = await validationSchema
        .validateAt('name', { name: longName })
        .catch((err) => err);
      expect(result.message).toBe(
        'Name must be no more than 50 characters long'
      );
    });

    it('should only allow valid characters', async () => {
      const result = await validationSchema
        .validateAt('name', { name: 'John123' })
        .catch((err) => err);
      expect(result.message).toBe(
        'Name can only contain letters, spaces, hyphens, and apostrophes'
      );
    });

    it('should accept valid names', async () => {
      const validNames = ['John Doe', "Mary-Jane O'Connor"];

      for (const name of validNames) {
        const result = await validationSchema.validateAt('name', { name });
        expect(result).toBe(name);
      }
    });
  });

  describe('relationship validation', () => {
    it('should require relationship', async () => {
      const result = await validationSchema
        .validateAt('relationship', { relationship: '' })
        .catch((err) => err);
      expect(result.message).toBe('Relationship is required');
    });

    it('should require minimum 1 character', async () => {
      const result = await validationSchema
        .validateAt('relationship', { relationship: '' })
        .catch((err) => err);
      expect(result.message).toBe('Relationship is required');
    });

    it('should limit to 100 characters', async () => {
      const longRelationship = 'A'.repeat(101);
      const result = await validationSchema
        .validateAt('relationship', { relationship: longRelationship })
        .catch((err) => err);
      expect(result.message).toBe(
        'Relationship must be no more than 100 characters long'
      );
    });

    it('should accept valid relationships', async () => {
      const validRelationships = [
        'Friend',
        'Family',
        'Colleague',
        'College Friend',
      ];

      for (const relationship of validRelationships) {
        const result = await validationSchema.validateAt('relationship', {
          relationship,
        });
        expect(result).toBe(relationship);
      }
    });
  });

  describe('attendance validation', () => {
    it('should require attendance selection', async () => {
      const result = await validationSchema
        .validateAt('attendance', { attendance: '' })
        .catch((err) => err);
      expect(result.message).toBe('Please select a valid attendance option');
    });

    it('should only allow valid options', async () => {
      const result = await validationSchema
        .validateAt('attendance', { attendance: 'invalid' })
        .catch((err) => err);
      expect(result.message).toBe('Please select a valid attendance option');
    });

    it('should accept valid attendance options', async () => {
      const validOptions = ['yes', 'no', 'maybe'];

      for (const attendance of validOptions) {
        const result = await validationSchema.validateAt('attendance', {
          attendance,
        });
        expect(result).toBe(attendance);
      }
    });
  });

  describe('message validation', () => {
    it('should be optional', async () => {
      const result = await validationSchema.validateAt('message', {
        message: '',
      });
      expect(result).toBe('');
    });

    it('should limit to 500 characters', async () => {
      const longMessage = 'A'.repeat(501);
      const result = await validationSchema
        .validateAt('message', { message: longMessage })
        .catch((err) => err);
      expect(result.message).toBe(
        'Message must be no more than 500 characters long'
      );
    });

    it('should accept valid messages', async () => {
      const validMessages = [
        '',
        'Congratulations!',
        'Looking forward to your special day!',
        'A'.repeat(500), // Exactly 500 characters
      ];

      for (const message of validMessages) {
        const result = await validationSchema.validateAt('message', {
          message,
        });
        expect(result).toBe(message);
      }
    });
  });

  describe('full form validation', () => {
    it('should validate complete valid form', async () => {
      const validForm = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: 'Congratulations!',
      };

      const result = await validationSchema.validate(validForm);
      expect(result).toEqual(validForm);
    });

    it('should validate form without optional message', async () => {
      const validForm = {
        name: 'John Doe',
        relationship: 'Friend',
        attendance: 'yes',
        message: '',
      };

      const result = await validationSchema.validate(validForm);
      expect(result).toEqual(validForm);
    });
  });
});
