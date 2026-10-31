export interface GuestImportRecord {
  guestGroup: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  rsvpStatus: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  dietaryPreference: 'VEG' | 'JAIN' | 'NON_VEG' | 'VEGAN' | 'OTHER';
  roomNumber?: string;
  accommodationAssigned: boolean;
  transportationNeeded: boolean;
  plusGuests: number;
  notes?: string;
}

const columnAliases: Record<string, string[]> = {
  guestGroup: ['group', 'guestgroup', 'family', 'familyside'],
  firstName: ['firstname', 'guestname', 'name'],
  lastName: ['lastname', 'surname', 'familyname'],
  phone: ['phone', 'mobile', 'contact', 'phonenumber'],
  email: ['email', 'emailaddress'],
  rsvpStatus: ['rsvp', 'rsvpstatus'],
  dietaryPreference: ['dietary', 'diet', 'dietarypreference'],
  roomNumber: ['room', 'roomnumber', 'suite'],
  accommodationAssigned: ['accommodationassigned', 'accommodation'],
  transportationNeeded: ['transportation', 'transportationneeded', 'transport'],
  plusGuests: ['plusguests', 'additionalguests'],
  notes: ['notes', 'note'],
};

const normalizeHeader = (value: unknown) =>
  String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

const cellText = (value: unknown) => String(value ?? '').trim();

const parseBoolean = (value: unknown) =>
  ['yes', 'true', '1', 'y'].includes(cellText(value).toLowerCase());

const parseRsvp = (value: unknown): GuestImportRecord['rsvpStatus'] => {
  const normalized = cellText(value).toUpperCase();
  if (['CONFIRMED', 'YES', 'ACCEPTED'].includes(normalized)) return 'CONFIRMED';
  if (['DECLINED', 'NO', 'REJECTED'].includes(normalized)) return 'DECLINED';
  return 'PENDING';
};

const parseDietary = (value: unknown): GuestImportRecord['dietaryPreference'] => {
  const normalized = cellText(value).toUpperCase().replace(/[\s-]+/g, '_');
  if (['VEG', 'JAIN', 'NON_VEG', 'VEGAN', 'OTHER'].includes(normalized)) {
    return normalized as GuestImportRecord['dietaryPreference'];
  }
  return 'VEG';
};

export const parseGuestImportRows = (rows: unknown[][]): GuestImportRecord[] => {
  const firstHeaderRow = rows.findIndex((row) => row.some((cell) => cellText(cell)));
  if (firstHeaderRow < 0) throw new Error('The selected file is empty.');

  const headers = rows[firstHeaderRow].map(normalizeHeader);
  const columnIndexes = new Map<string, number>();
  for (const [field, aliases] of Object.entries(columnAliases)) {
    const index = headers.findIndex((header) => aliases.includes(header));
    if (index >= 0) columnIndexes.set(field, index);
  }

  if (!columnIndexes.has('firstName') || !columnIndexes.has('lastName')) {
    throw new Error('The file must include First Name and Last Name columns.');
  }

  const valueFor = (row: unknown[], field: string) => {
    const index = columnIndexes.get(field);
    return index === undefined ? undefined : row[index];
  };

  const guests = rows.slice(firstHeaderRow + 1)
    .map((row, index) => {
      const firstName = cellText(valueFor(row, 'firstName'));
      const lastName = cellText(valueFor(row, 'lastName'));
      if (!row.some((cell) => cellText(cell))) return null;
      if (!firstName || !lastName) {
        throw new Error(`Row ${firstHeaderRow + index + 2} needs both First Name and Last Name.`);
      }

      const roomNumber = cellText(valueFor(row, 'roomNumber'));
      return {
        guestGroup: cellText(valueFor(row, 'guestGroup')) || 'General',
        firstName,
        lastName,
        phone: cellText(valueFor(row, 'phone')) || undefined,
        email: cellText(valueFor(row, 'email')) || undefined,
        rsvpStatus: parseRsvp(valueFor(row, 'rsvpStatus')),
        dietaryPreference: parseDietary(valueFor(row, 'dietaryPreference')),
        roomNumber: roomNumber || undefined,
        accommodationAssigned:
          parseBoolean(valueFor(row, 'accommodationAssigned')) || Boolean(roomNumber),
        transportationNeeded: parseBoolean(valueFor(row, 'transportationNeeded')),
        plusGuests: Math.max(0, Number.parseInt(cellText(valueFor(row, 'plusGuests')), 10) || 0),
        notes: cellText(valueFor(row, 'notes')) || undefined,
      };
    })
    .filter((guest): guest is NonNullable<typeof guest> => guest !== null);

  if (guests.length === 0) throw new Error('No guest rows were found under the header row.');
  return guests;
};

export const parseGuestCsv = (content: string): GuestImportRecord[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuotes = false;
  const input = content.replace(/^\uFEFF/, '');

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (insideQuotes && input[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (insideQuotes) throw new Error('The CSV file contains an unclosed quoted value.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return parseGuestImportRows(rows);
};
