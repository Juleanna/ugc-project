// Оновлений Services компонент з використанням API утиліти
'use client'
import { useState, useEffect } from 'react'
import { api, safeArray } from '@/lib/api'

function Services() {
  const { t } = useTranslations()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const data = await api.services.getFeatured()
        const servicesArray = safeArray(data)
        
        setServices(servicesArray)
      } catch (err) {
        console.error('Помилка завантаження послуг:', err)
        setError(err.message)
        setServices([]) // Встановлюємо пустий масив у разі помилки
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  // Статичні послуги як fallback
  const fallbackServices = [
    {
      id: 'tech-specs',
      name: t('services.technicalSpecs.title') || 'Розробка технічних умов (ТУ)',
      short_description: t('services.technicalSpecs.description') || 'Ми спеціалізуємося на створенні технічних умов згідно з вашими вимогами.'
    },
    {
      id: 'tailoring',
      name: t('services.tailoring.title') || 'Пошиття одягу',
      short_description: t('services.tailoring.description') || 'За вашими специфікаціями ми виготовляємо продукцію з використанням ваших матеріалів або наших власних.'
    },
    {
      id: 'logo',
      name: t('services.logoApplication.title') || 'Нанесення логотипу',
      short_description: t('services.logoApplication.description') || 'Ми пропонуємо послуги нанесення логотипу або бренду на вироби.'
    },
    {
      id: 'other',
      name: t('services.other.title') || 'Інше',
      short_description: t('services.other.description') || 'Крім того, ми пропонуємо широкий асортимент готових виробів, тканин та фурнітури.'
    }
  ]

  // Використовуємо дані з API або fallback
  const displayServices = services.length > 0 ? services : fallbackServices

  return (
    <>
      <SectionIntro
        eyebrow={t('services.eyebrow') || 'Послуги'}
        title={t('services.title') || 'Ми створюємо якісний спецодяг під ваші потреби.'}
        className="mt-24 sm:mt-32 lg:mt-40"
      >
        <p>
          {t('services.description') || 'Ми виготовляємо спецодяг для різних галузей, включаючи військову форму, медичний одяг, а також спецодяг для інших сфер.'}
        </p>
      </SectionIntro>
      
      <Container className="mt-16">
        <div className="lg:flex lg:items-center lg:justify-end">
          <div className="flex justify-center lg:w-1/2 lg:justify-end lg:pr-12">
            <FadeIn className="w-[33.75rem] flex-none lg:w-[45rem]">
              <StylizedImage
                src={imageLaptop}
                sizes="(min-width: 1024px) 41rem, 31rem"
                className="justify-center lg:justify-end"
              />
            </FadeIn>
          </div>
          
          <List className="mt-16 lg:mt-0 lg:w-1/2 lg:min-w-[33rem] lg:pl-4">
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-950"></div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-amber-600 mb-4 p-3 bg-amber-50 rounded">
                Помилка завантаження: {error}. Показані статичні дані.
              </div>
            )}
            
            {displayServices.slice(0, 4).map((service, index) => (
              <ListItem 
                key={service.id || index}
                title={service.name}
              >
                {service.short_description}
              </ListItem>
            ))}
          </List>
        </div>
      </Container>
    </>
  )
}