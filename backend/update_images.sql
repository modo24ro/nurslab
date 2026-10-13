UPDATE cms_sections 
SET metadata_json = jsonb_set(metadata_json::jsonb, '{image_url}', '"/images/home_nursing.jpg"') 
WHERE section_key = 'home_nursing';

UPDATE cms_content_blocks SET image_url = '/images/free_resources.jpg' WHERE section_key = 'learning_paths' AND block_key = 'free_resources';
UPDATE cms_content_blocks SET image_url = '/images/online_courses.jpg' WHERE section_key = 'learning_paths' AND block_key = 'online_courses';
UPDATE cms_content_blocks SET image_url = '/images/workshops_nurses.jpg' WHERE section_key = 'learning_paths' AND block_key = 'physical_workshops';

UPDATE cms_content_blocks SET image_url = '/images/guest_ana.jpg' WHERE section_key = 'guests_webinars' AND block_key = 'specialist_interviews';
UPDATE cms_content_blocks SET image_url = '/images/guest_radu.jpg' WHERE section_key = 'guests_webinars' AND block_key = 'guest_webinars';
UPDATE cms_content_blocks SET image_url = '/images/guest_elena.jpg' WHERE section_key = 'guests_webinars' AND block_key = 'patient_discussions';

UPDATE cms_content_blocks SET image_url = '/images/journey_theory.jpg' WHERE section_key = 'learning_journey' AND block_key = 'step_1_theory';
UPDATE cms_content_blocks SET image_url = '/images/journey_demo.jpg' WHERE section_key = 'learning_journey' AND block_key = 'step_2_demo';
UPDATE cms_content_blocks SET image_url = '/images/journey_feedback.jpg' WHERE section_key = 'learning_journey' AND block_key = 'step_3_quiz';
UPDATE cms_content_blocks SET image_url = '/images/journey_practice.jpg' WHERE section_key = 'learning_journey' AND block_key = 'step_4_workshop';

UPDATE cms_content_blocks SET image_url = '/images/medical_world_emergency.jpg' WHERE section_key = 'medical_world' AND block_key = 'people_in_medicine';
UPDATE cms_content_blocks SET image_url = '/images/medical_world_care.jpg' WHERE section_key = 'medical_world' AND block_key = 'education_career';
UPDATE cms_content_blocks SET image_url = '/images/medical_world_ethics.jpg' WHERE section_key = 'medical_world' AND block_key = 'nursing_technology';
