package ec.edu.espe.msinventario.services;

import ec.edu.espe.msinventario.models.entities.Sucursal;
import ec.edu.espe.msinventario.repositories.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SucursalServiceImpl implements SucursalService {

    @Autowired
    private SucursalRepository repository;

    @Override
    public List<Sucursal> listarTodos() {
        return (List<Sucursal>) repository.findAll();
    }

    @Override
    public Optional<Sucursal> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public Sucursal guardar(Sucursal sucursal) {
        return repository.save(sucursal);
    }

    @Override
    public void eliminar(Long id) {
        repository.deleteById(id);
    }
}