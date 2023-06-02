import { getCriminalRecords } from "../../src/services/registro-civil.service.js";
import axios from 'axios';

jest.mock('axios');

describe('getCriminalRecords', () => {
  it('[ERROR] should return false for RUT 555555555', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: {} });
    const result = await getCriminalRecords('555555555');
    expect(result).toBe(false);
  });

  it('[SUCCES] should return true for any RUT other than 555555555', async () => {
    axios.get = jest.fn().mockResolvedValue({ data: {} });
    const result = await getCriminalRecords('123456789');
    expect(result).toBe(true);
  });
});

