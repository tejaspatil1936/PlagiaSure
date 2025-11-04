# File Upload Components

A modern, beautiful set of file upload components with drag-and-drop functionality, cloud integration hints, and a design that matches the PlagiaSure theme.

## Components

### 1. FileUploadModal

A complete modal for uploading assignments with form fields and file selection.

**Features:**
- Drag and drop file upload
- File type validation (PDF, DOCX, DOC, TXT)
- File size validation (10MB limit)
- Form fields for student name, course name, and assignment title
- Cloud integration preview (coming soon)
- Beautiful gradient header with animations
- Error handling and loading states

**Usage:**
```jsx
import { FileUploadModal } from '../components/FileUpload';

<FileUploadModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onUpload={handleUpload}
  uploading={uploading}
  error={error}
/>
```

### 2. DropZone

A reusable drag-and-drop file upload component.

**Features:**
- Customizable accepted file types
- File size limits
- Multiple file support
- Visual feedback for drag states
- File preview with icons
- Remove selected files

**Usage:**
```jsx
import { DropZone } from '../components/FileUpload';

<DropZone
  onFileSelect={handleFileSelect}
  acceptedTypes={['.pdf', '.docx', '.txt']}
  maxSize={10 * 1024 * 1024}
  multiple={false}
/>
```

### 3. CloudIntegration

A component showing cloud storage integration options (coming soon).

**Features:**
- Preview of supported cloud providers
- Dropbox, Google Drive, OneDrive, iCloud
- "Coming Soon" badges
- Informational message about future integration

**Usage:**
```jsx
import { CloudIntegration } from '../components/FileUpload';

<CloudIntegration
  onCloudSelect={handleCloudSelect}
  disabled={uploading}
/>
```

## Design Features

### Color Scheme
- **Primary Blue**: `#3282B8` - Used for active states and primary actions
- **Dark Blue**: `#2D4B7C` - Used for hover states and darker elements
- **Teal**: `#3AB795` - Used for secondary elements
- **Bright Green**: `#52DE97` - Used for success states and completed actions

### Animations
- Smooth transitions on all interactive elements
- Scale animations on drag hover
- Bounce animation for upload icon during drag
- Pulse animation for active drag states
- Gradient backgrounds with smooth transitions

### Responsive Design
- Mobile-friendly layouts
- Touch-friendly drag and drop
- Responsive grid layouts for cloud providers
- Proper spacing and sizing on all screen sizes

## File Type Support

Currently supported file types:
- **PDF** (.pdf) - Portable Document Format
- **DOCX** (.docx) - Microsoft Word (newer format)
- **DOC** (.doc) - Microsoft Word (legacy format)
- **TXT** (.txt) - Plain text files

## File Size Limits

- Maximum file size: **10MB**
- Automatic validation with user-friendly error messages
- File size display in human-readable format (KB, MB, GB)

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators
- Semantic HTML structure

## Future Enhancements

1. **Cloud Integration**
   - Dropbox API integration
   - Google Drive API integration
   - OneDrive API integration
   - iCloud integration (when available)

2. **Additional Features**
   - Progress bars for large file uploads
   - Batch upload support
   - File preview thumbnails
   - Upload resume functionality
   - Compression options for large files

3. **Enhanced Validation**
   - Content-based file type detection
   - Virus scanning integration
   - Advanced file format validation

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18+
- Lucide React (for icons)
- Tailwind CSS (for styling)
- Custom utility functions from `../../lib/utils`