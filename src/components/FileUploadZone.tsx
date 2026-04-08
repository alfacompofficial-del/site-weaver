import { useCallback, useState } from 'react';
import { Upload, FileText, Archive, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { toast } from 'sonner';

interface UploadedFiles {
  html: string;
  css: string;
  js: string;
}

interface FileUploadZoneProps {
  onFilesLoaded: (files: UploadedFiles) => void;
  currentFiles: UploadedFiles;
}

export default function FileUploadZone({ onFilesLoaded, currentFiles }: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const categorizeFile = (name: string, content: string, result: UploadedFiles) => {
    const lower = name.toLowerCase();
    if (lower.endsWith('.html') || lower.endsWith('.htm')) {
      result.html = content;
    } else if (lower.endsWith('.css')) {
      result.css += (result.css ? '\n' : '') + content;
    } else if (lower.endsWith('.js')) {
      result.js += (result.js ? '\n' : '') + content;
    }
  };

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const result: UploadedFiles = { html: '', css: '', js: '' };
    const names: string[] = [];

    for (const file of fileArray) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = await JSZip.loadAsync(file);
          const entries = Object.entries(zip.files).filter(([, f]) => !f.dir);
          
          for (const [path, zipFile] of entries) {
            const fileName = path.split('/').pop() || path;
            if (fileName.startsWith('.') || fileName.startsWith('__')) continue;
            
            const ext = fileName.toLowerCase();
            if (ext.endsWith('.html') || ext.endsWith('.htm') || ext.endsWith('.css') || ext.endsWith('.js')) {
              const content = await zipFile.async('string');
              categorizeFile(fileName, content, result);
              names.push(fileName);
            }
          }
          toast.success(`ZIP распакован: ${names.length} файлов`);
        } catch {
          toast.error('Ошибка распаковки ZIP');
        }
      } else {
        const ext = file.name.toLowerCase();
        if (ext.endsWith('.html') || ext.endsWith('.htm') || ext.endsWith('.css') || ext.endsWith('.js')) {
          const content = await readFileAsText(file);
          categorizeFile(file.name, content, result);
          names.push(file.name);
        } else {
          toast.error(`Неподдерживаемый файл: ${file.name}`);
        }
      }
    }

    if (names.length > 0) {
      setFileNames(names);
      onFilesLoaded(result);
    }
  }, [onFilesLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) processFiles(e.target.files);
  }, [processFiles]);

  const hasContent = currentFiles.html || currentFiles.css || currentFiles.js;

  const clearFiles = () => {
    setFileNames([]);
    onFilesLoaded({ html: '', css: '', js: '' });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        }`}
        onClick={() => document.getElementById('file-upload-input')?.click()}
      >
        <input
          id="file-upload-input"
          type="file"
          multiple
          accept=".html,.htm,.css,.js,.zip"
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="w-5 h-5" />
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Перетащите файлы или нажмите для выбора
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              HTML, CSS, JS файлы или ZIP-архив
            </p>
          </div>
        </div>
      </div>

      {fileNames.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {fileNames.map((name, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-xs font-mono text-foreground">
              <FileText className="w-3 h-3 text-muted-foreground" />
              {name}
            </span>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFiles} className="h-7 px-2">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {hasContent && (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className={`rounded-md px-2 py-1 ${currentFiles.html ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
            HTML {currentFiles.html ? `(${currentFiles.html.length} символов)` : '—'}
          </div>
          <div className={`rounded-md px-2 py-1 ${currentFiles.css ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
            CSS {currentFiles.css ? `(${currentFiles.css.length} символов)` : '—'}
          </div>
          <div className={`rounded-md px-2 py-1 ${currentFiles.js ? 'bg-primary/10 text-primary' : 'bg-secondary'}`}>
            JS {currentFiles.js ? `(${currentFiles.js.length} символов)` : '—'}
          </div>
        </div>
      )}
    </div>
  );
}
