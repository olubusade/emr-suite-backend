import { Appointment, Patient, User } from '../../models/index.js';
import { listAppointments } from '../appointment.service';

// Mock calculateAge only, preserve other exports
jest.mock("../../utils/myLibrary.js", () => {
  const originalModule = jest.requireActual("../../utils/myLibrary.js");
  return {
    __esModule: true,
    ...originalModule,
    calculateAge: jest.fn(),
  };
});
// Mock Sequelize operators
const Op = {
  lt: Symbol('lt'),
  gt: Symbol('gt'),
  between: Symbol('between'),
};
const Ou = {
  iLike: Symbol('iLike'),
};

// Patch global scope for Op and Ou as used in the tested file
global.Op = Op;
global.Ou = Ou;

describe('listAppointments() listAppointments method', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- HAPPY PATHS ---

  it('should return paginated appointments with default parameters', async () => {
    // This test ensures the function returns appointments with default pagination and no filters.
    const mockRows = [
      {
        id: 1,
        patientId: 10,
        staffId: 20,
        appointmentDate: new Date('2024-06-01T10:00:00Z'),
        durationMinutes: 30,
        reason: 'Checkup',
        notes: 'N/A',
        status: 'scheduled',
        patient: {
          id: 10,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        staff: {
          id: 20,
          fullName: 'Dr. Smith',
          email: 'smith@example.com',
        },
      },
    ];
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await listAppointments({});
    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 20,
        offset: 0,
        order: [['appointmentDate', 'DESC']],
        where: {},
        include: [
          expect.objectContaining({
            model: Patient,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            where: {},
          }),
          expect.objectContaining({
            model: User,
            as: 'staff',
            attributes: ['id', 'fullName', 'email'],
          }),
        ],
      })
    );
    expect(result).toEqual({
      items: [
        {
          id: 1,
          patientId: 10,
          staffId: 20,
          appointmentDate: new Date('2024-06-01T10:00:00Z'),
          durationMinutes: 30,
          reason: 'Checkup',
          notes: 'N/A',
          status: 'scheduled',
          patient: {
            id: 10,
            fullName: 'John Doe',
            email: 'john@example.com',
          },
          staff: {
            id: 20,
            fullName: 'Dr. Smith',
            email: 'smith@example.com',
          },
        },
      ],
      total: 1,
      page: 1,
      pages: 1,
    });
  });

  it('should apply search filter to patient firstName', async () => {
    // This test ensures the search parameter is used to filter patients by firstName.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    await listAppointments({ search: 'Jane' });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.arrayContaining([
          expect.objectContaining({
            where: { firstName: { [Ou.iLike]: '%Jane%' } },
          }),
        ]),
      })
    );
  });

  it('should filter appointments by status "PAST"', async () => {
    // This test ensures the status "PAST" sets the correct where clause.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    await listAppointments({ status: 'PAST' });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          appointmentDate: { [Op.lt]: expect.any(Date) },
        },
      })
    );
  });

  it('should filter appointments by status "UPCOMING"', async () => {
    // This test ensures the status "UPCOMING" sets the correct where clause.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    await listAppointments({ status: 'UPCOMING' });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          appointmentDate: { [Op.gt]: expect.any(Date) },
        },
      })
    );
  });

  it('should filter appointments by status "TODAY"', async () => {
    // This test ensures the status "TODAY" sets the correct where clause with a date range.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    await listAppointments({ status: 'TODAY' });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          appointmentDate: {
            [Op.between]: [expect.any(Date), expect.any(Date)],
          },
        },
      })
    );
  });

  it('should handle appointments with missing patient or staff gracefully', async () => {
    // This test ensures that if patient or staff is null, the result contains null for those fields.
    const mockRows = [
      {
        id: 2,
        patientId: 11,
        staffId: 21,
        appointmentDate: new Date('2024-06-02T10:00:00Z'),
        durationMinutes: 45,
        reason: 'Consultation',
        notes: 'Bring reports',
        status: 'scheduled',
        patient: null,
        staff: null,
      },
    ];
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await listAppointments({});
    expect(result.items[0].patient).toBeNull();
    expect(result.items[0].staff).toBeNull();
  });

  it('should use provided page and pageSize for pagination', async () => {
    // This test ensures that custom page and pageSize are used for limit and offset.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 5,
      rows: [],
    });

    await listAppointments({ page: 2, pageSize: 5 });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 5,
        offset: 5,
      })
    );
  });

  // --- EDGE CASES ---

  it('should default to page 1 and pageSize 20 if invalid values are provided', async () => {
    // This test ensures that invalid page and pageSize values are defaulted.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    await listAppointments({ page: 'abc', pageSize: null });

    expect(Appointment.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 20,
        offset: 0,
      })
    );
  });

  it('should return empty items and correct pagination when no appointments found', async () => {
    // This test ensures that when no appointments are found, the result is empty but pagination is correct.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 0,
      rows: [],
    });

    const result = await listAppointments({});
    expect(result).toEqual({
      items: [],
      total: 0,
      page: 1,
      pages: 0,
    });
  });

  it('should handle appointments with missing optional fields', async () => {
    // This test ensures that missing optional fields (notes, reason, durationMinutes) are handled.
    const mockRows = [
      {
        id: 3,
        patientId: 12,
        staffId: 22,
        appointmentDate: new Date('2024-06-03T10:00:00Z'),
        durationMinutes: null,
        reason: null,
        notes: null,
        status: 'scheduled',
        patient: {
          id: 12,
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
        },
        staff: {
          id: 22,
          fullName: 'Dr. Adams',
          email: 'adams@example.com',
        },
      },
    ];
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await listAppointments({});
    expect(result.items[0].durationMinutes).toBeNull();
    expect(result.items[0].reason).toBeNull();
    expect(result.items[0].notes).toBeNull();
  });

  it('should handle pageSize larger than total count', async () => {
    // This test ensures that if pageSize is larger than total count, pages is 1.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 3,
      rows: [],
    });

    const result = await listAppointments({ page: 1, pageSize: 10 });
    expect(result.pages).toBe(1);
  });

  it('should handle page number greater than total pages', async () => {
    // This test ensures that if page number is greater than total pages, items is empty.
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 2,
      rows: [],
    });

    const result = await listAppointments({ page: 5, pageSize: 1 });
    expect(result.items).toEqual([]);
    expect(result.page).toBe(5);
    expect(result.pages).toBe(2);
  });

  it('should handle appointments with staff but no patient', async () => {
    // This test ensures that if patient is null but staff is present, the result is correct.
    const mockRows = [
      {
        id: 4,
        patientId: 13,
        staffId: 23,
        appointmentDate: new Date('2024-06-04T10:00:00Z'),
        durationMinutes: 60,
        reason: 'Follow-up',
        notes: 'N/A',
        status: 'scheduled',
        patient: null,
        staff: {
          id: 23,
          fullName: 'Dr. Brown',
          email: 'brown@example.com',
        },
      },
    ];
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await listAppointments({});
    expect(result.items[0].patient).toBeNull();
    expect(result.items[0].staff).toEqual({
      id: 23,
      fullName: 'Dr. Brown',
      email: 'brown@example.com',
    });
  });

  it('should handle appointments with patient but no staff', async () => {
    // This test ensures that if staff is null but patient is present, the result is correct.
    const mockRows = [
      {
        id: 5,
        patientId: 14,
        staffId: 24,
        appointmentDate: new Date('2024-06-05T10:00:00Z'),
        durationMinutes: 15,
        reason: 'Vaccine',
        notes: 'First dose',
        status: 'scheduled',
        patient: {
          id: 14,
          firstName: 'Bob',
          lastName: 'Lee',
          email: 'bob@example.com',
        },
        staff: null,
      },
    ];
    Appointment.findAndCountAll = jest.fn().mockResolvedValue({
      count: 1,
      rows: mockRows,
    });

    const result = await listAppointments({});
    expect(result.items[0].patient).toEqual({
      id: 14,
      fullName: 'Bob Lee',
      email: 'bob@example.com',
    });
    expect(result.items[0].staff).toBeNull();
  });
});