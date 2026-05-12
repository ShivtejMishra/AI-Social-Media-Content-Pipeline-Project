// CampaignGenerator is handled within ContentGenerator.
// Select "Campaign Ideas" as content type to generate campaigns.
// This file is a redirect stub.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '../../store/contentStore';

const CampaignGenerator = () => {
  const navigate = useNavigate();
  const { setSelectedContentType } = useContentStore();

  useEffect(() => {
    setSelectedContentType('campaign_ideas');
    navigate('/generate', { replace: true });
  }, []);

  return null;
};

export default CampaignGenerator;
