import { createFileRoute } from '@tanstack/react-router';
import ToolPage from '@/components/verifai/tools/ToolPage';
import CsvJsonConverter from '@/components/verifai/tools/CsvJsonConverter';
export const Route = createFileRoute('/tools/csv-json')({
  component: () => (<ToolPage title="CSV to JSON Converter" description="Convert CSV data to formatted JSON instantly in your browser."><CsvJsonConverter /></ToolPage>),
});
