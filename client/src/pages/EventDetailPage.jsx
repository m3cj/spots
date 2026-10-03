import { useParams } from 'react-router-dom';
import PagePlaceholder from '@/components/PagePlaceholder';

export default function EventDetailPage() {
  const { id } = useParams();
  return <PagePlaceholder title="Event" detail={`Event #${id}`} />;
}
