import { 
  DataSiswa, 
  WawancaraSiswaData, 
  ObservasiSiswaData, 
  HasilObservasiOrtuData, 
  StatusKelulusanInfo 
} from '../types';

// Seluruh data dummy telah dihapus.
// Website kini 100% membaca data secara langsung dari Database Google Spreadsheet.

export const INITIAL_DATA_SISWA: DataSiswa[] = [];

export const INITIAL_OTM_RAW_MAP: { [noPend: string]: { [refId: number]: string } } = {};

export const INITIAL_HASIL_WAWANCARA_ORTU_MAP: { [noPend: string]: HasilObservasiOrtuData } = {};

export const INITIAL_OBSERVASI_SISWA_LIST: ObservasiSiswaData[] = [];

export const INITIAL_WAWANCARA_SISWA: WawancaraSiswaData[] = [];

export const INITIAL_STATUS_KELULUSAN: StatusKelulusanInfo[] = [];
